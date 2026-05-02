import { ref } from 'vue';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

// Connection map for drawing the hand skeleton
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17], [0, 5], [0, 17]
];

export function useHandTracking() {
  const videoElement = ref<HTMLVideoElement | null>(null);
  const canvasElement = ref<HTMLCanvasElement | null>(null);
  const isReady = ref(false);
  const detectedGesture = ref<string | null>(null);

  let hands: Hands | null = null;
  let camera: Camera | null = null;
  let model: tf.LayersModel | null = null;
  let labels: string[] = [];
  let trackingActive = false;

  const loadModel = async () => {
    try {
      const response = await fetch('/model/model_data.json');
      const modelData = await response.json();

      // Automatically patch batch_shape to batch_input_shape for TFJS compatibility
      if (modelData.config && modelData.config.config && modelData.config.config.layers) {
        modelData.config.config.layers.forEach((layer: any) => {
          if (layer.config && layer.config.batch_shape) {
            layer.config.batch_input_shape = layer.config.batch_shape;
          }
        });
      }

      const labelsResponse = await fetch('/model/labels.txt');
      const labelsText = await labelsResponse.text();
      labels = labelsText.split('\n').map(l => l.trim()).filter(l => l !== "");
      
      model = await tf.models.modelFromJSON(modelData.config);
      
      // Robust layer-by-layer weight assignment
      const weightBearingLayers = model.layers.filter(l => l.weights.length > 0);
      const exportedWeightSets = modelData.weights.filter((w: any[]) => w.length > 0);

      if (weightBearingLayers.length !== exportedWeightSets.length) {
        console.warn(`Layer mismatch: Model has ${weightBearingLayers.length} weight-bearing layers, but exported data has ${exportedWeightSets.length}.`);
      }

      weightBearingLayers.forEach((layer, i) => {
        if (exportedWeightSets[i]) {
          const tensors = exportedWeightSets[i].map((w: any) => tf.tensor(w));
          layer.setWeights(tensors);
        }
      });
      
      console.log("AI Model Loaded. Classes:", labels);
    } catch (e) {
      console.error("Model load error:", e);
    }
  };

  const normalizeLandmarks = (landmarks: any[]) => {
    const tempLandmarks = landmarks.map(lm => [lm.x, lm.y, lm.z]);
    const wrist = tempLandmarks[0];
    const centered = tempLandmarks.map(lm => [lm[0] - wrist[0], lm[1] - wrist[1], lm[2] - wrist[2]]);
    const flat = centered.flat();
    const maxVal = Math.max(...flat.map(Math.abs));
    return maxVal !== 0 ? flat.map(v => v / maxVal) : flat;
  };

  const predictGesture = async (results: Results) => {
    if (!model || !results.multiHandLandmarks) return null;

    let rawRight = new Array(21).fill([0, 0, 0]);
    let rawLeft = new Array(21).fill([0, 0, 0]);
    let rightDetected = false;
    let leftDetected = false;

    // 1. Collect raw landmarks and identify which hand is which
    results.multiHandLandmarks.forEach((landmarks, index) => {
      const label = results.multiHandedness[index].label; // "Left" or "Right"
      
      // Flip X back to "Standard" orientation for the model if using selfieMode
      const coords = landmarks.map(lm => [1.0 - lm.x, lm.y, lm.z]);
      
      if (label === "Right") {
        rawRight = coords;
        rightDetected = true;
      } else {
        rawLeft = coords;
        leftDetected = true;
      }
    });

    // 2. Combined Normalization (Matching extract_landmarks.py)
    // Use Right hand wrist as origin if available, otherwise Left hand wrist
    let origin = [0, 0, 0];
    if (rightDetected) origin = rawRight[0];
    else if (leftDetected) origin = rawLeft[0];

    // Subtract origin ONLY from detected hands (MATCHING PYTHON LOGIC)
    const normRight = rightDetected 
      ? rawRight.map(pt => [pt[0] - origin[0], pt[1] - origin[1], pt[2] - origin[2]])
      : new Array(21).fill(0).map(() => [0, 0, 0]);
      
    const normLeft = leftDetected
      ? rawLeft.map(pt => [pt[0] - origin[0], pt[1] - origin[1], pt[2] - origin[2]])
      : new Array(21).fill(0).map(() => [0, 0, 0]);

    // 3. Global Scaling
    const combined = [...normRight, ...normLeft];
    const flat = combined.flat();
    const maxVal = Math.max(...flat.map(Math.abs));
    
    const finalFeatures = maxVal !== 0 ? flat.map(v => v / maxVal) : flat;

    const inputTensor = tf.tensor2d([finalFeatures]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const scores = await prediction.data();
    
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const confidence = scores[maxScoreIndex];

    if (confidence > 0.45) { // Confidence threshold
      return labels[maxScoreIndex];
    }
    return null;
  };

  const onResults = async (results: Results) => {
    if (!canvasElement.value || !videoElement.value) return;
    const canvasCtx = canvasElement.value.getContext('2d');
    if (!canvasCtx) return;

    // Ensure canvas matches video internal resolution
    if (canvasElement.value.width !== videoElement.value.videoWidth) {
      canvasElement.value.width = videoElement.value.videoWidth;
      canvasElement.value.height = videoElement.value.videoHeight;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height);
    
    // Mirror the canvas for user feedback if the video is mirrored via CSS
    canvasCtx.translate(canvasElement.value.width, 0);
    canvasCtx.scale(-1, 1);
    
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // @ts-ignore
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#4ade80', lineWidth: 5});
        // @ts-ignore
        drawLandmarks(canvasCtx, landmarks, {color: '#facc15', lineWidth: 2});
      }
    }

    const gesture = await predictGesture(results);
    detectedGesture.value = gesture;
    canvasCtx.restore();
  };

  const startTracking = async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoElement.value = video;
    canvasElement.value = canvas;
    await loadModel();

    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true, // This mirrors the handedness labels internally to match "Selfie" perspective
    });

    hands.onResults(onResults);

    camera = new Camera(videoElement.value, {
      onFrame: async () => {
        if (hands && trackingActive) {
          try {
            await hands.send({ image: videoElement.value! });
          } catch (e) {
            console.warn("MediaPipe send error:", e);
          }
        }
      },
      width: 640,
      height: 480,
    });

    await camera.start();
    trackingActive = true;
    isReady.value = true;
  };

  const stopTracking = () => {
    trackingActive = false;
    if (camera) {
      camera.stop();
      camera = null;
    }
    if (hands) {
      hands.close();
      hands = null;
    }
    isReady.value = false;
  };

  return {
    isReady,
    detectedGesture,
    startTracking,
    stopTracking,
  };
}
