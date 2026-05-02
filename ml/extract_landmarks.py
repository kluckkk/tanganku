import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import pandas as pd
import os
import numpy as np
import requests

# Configuration
DATASET_PATH = r'D:\HandTracking\datasetBISINDO'
OUTPUT_CSV = 'landmarks.csv'
MODEL_PATH = 'hand_landmarker.task'

def download_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Downloading {MODEL_PATH}...")
        url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        r = requests.get(url, allow_redirects=True)
        open(MODEL_PATH, 'wb').write(r.content)
        print("Download complete.")

def normalize_landmarks(landmarks):
    # Convert to numpy array
    temp_landmarks = []
    for lm in landmarks:
        temp_landmarks.append([lm.x, lm.y, lm.z])
    
    temp_landmarks = np.array(temp_landmarks)
    
    # Zero-centering (relative to wrist)
    base_x, base_y, base_z = temp_landmarks[0]
    temp_landmarks = temp_landmarks - [base_x, base_y, base_z]
    
    # Scaling
    max_val = np.max(np.abs(temp_landmarks))
    if max_val != 0:
        temp_landmarks = temp_landmarks / max_val
        
    return temp_landmarks.flatten().tolist()

def extract_landmarks():
    download_model()
    
    # Initialize the Hand Landmarker for 2 hands (Lowered thresholds for overlapping hands)
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.HandLandmarkerOptions(base_options=base_options,
                                           num_hands=2,
                                           min_hand_detection_confidence=0.3,
                                           min_hand_presence_confidence=0.3,
                                           min_tracking_confidence=0.3)
    
    landmarker = vision.HandLandmarker.create_from_options(options)
    
    data = []
    
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset path '{DATASET_PATH}' does not exist.")
        return

    labels = sorted([f for f in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, f))])
    
    for label in labels:
        label_path = os.path.join(DATASET_PATH, label)
        print(f"Processing label: {label}")
        
        count = 0
        for img_name in os.listdir(label_path):
            img_path = os.path.join(label_path, img_name)
            image = cv2.imread(img_path)
            
            if image is None:
                continue
                
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
            
            results = landmarker.detect(mp_image)
            
            if results.hand_landmarks:
                # We want: [Right Hand (63), Left Hand (63), Label]
                # Initialize with zeros
                raw_right = np.zeros((21, 3))
                raw_left = np.zeros((21, 3))
                right_detected = False
                left_detected = False
                
                # 1. Collect raw landmarks
                for i in range(len(results.hand_landmarks)):
                    handedness = results.handedness[i][0].category_name # "Left" or "Right"
                    lms = results.hand_landmarks[i]
                    coords = np.array([[lm.x, lm.y, lm.z] for lm in lms])
                    
                    if handedness == "Right":
                        raw_right = coords
                        right_detected = True
                    else:
                        raw_left = coords
                        left_detected = True
                
                # 2. Combined Normalization
                # Use Right hand wrist as origin if available, otherwise Left hand wrist
                if right_detected:
                    origin = raw_right[0]
                elif left_detected:
                    origin = raw_left[0]
                else:
                    origin = np.array([0, 0, 0])
                
                # Subtract origin from all detected landmarks
                if right_detected:
                    raw_right = raw_right - origin
                if left_detected:
                    raw_left = raw_left - origin
                
                # 3. Global Scaling
                # Combine all non-zero landmarks to find max scale
                all_coords = []
                if right_detected: all_coords.append(raw_right)
                if left_detected: all_coords.append(raw_left)
                
                if all_coords:
                    combined = np.vstack(all_coords)
                    max_val = np.max(np.abs(combined))
                    if max_val != 0:
                        if right_detected: raw_right /= max_val
                        if left_detected: raw_left /= max_val
                
                row = raw_right.flatten().tolist() + raw_left.flatten().tolist() + [label]
                data.append(row)
                count += 1
        
        print(f"  -> Extracted {count} samples for '{label}'")
    
    # Create column names
    columns = []
    # Hand 1 is ALWAYS Right, Hand 2 is ALWAYS Left
    for hand_name in ["right", "left"]:
        for i in range(21):
            columns.extend([f'x{i}_{hand_name}', f'y{i}_{hand_name}', f'z{i}_{hand_name}'])
    columns.append('label')
    
    df = pd.DataFrame(data, columns=columns)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nSuccessfully saved {len(df)} total samples (Right/Left separated) to {OUTPUT_CSV}")

if __name__ == "__main__":
    extract_landmarks()
