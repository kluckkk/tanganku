import tensorflow as tf
import json
import numpy as np
import os

def export_manual():
    model_path = 'gesture_model/model.h5'
    output_path = 'gesture_model/model_data.json'
    
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        return

    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    # 1. Get the architecture
    model_config = json.loads(model.to_json())
    
    # FIX: Rename 'batch_shape' to 'batch_input_shape' for TFJS compatibility
    # This prevents the "Unknown layer: InputLayer" error in the browser.
    if 'layers' in model_config['config']:
        for layer in model_config['config']['layers']:
            if 'batch_shape' in layer['config']:
                layer['config']['batch_input_shape'] = layer['config'].pop('batch_shape')
    
    # 2. Get the weights
    weights_data = []
    for layer in model.layers:
        layer_weights = []
        for w in layer.get_weights():
            layer_weights.append(w.tolist())
        weights_data.append(layer_weights)
        
    # 3. Save everything
    export_data = {
        'config': model_config,
        'weights': weights_data
    }
    
    with open(output_path, 'w') as f:
        json.dump(export_data, f)
        
    print(f"\nSUCCESS! Model exported manually to {output_path}")
    print("This file contains everything the Vue app needs to 'rebuild' your model.")

if __name__ == "__main__":
    export_manual()
