import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

# Configuration
INPUT_CSV = 'landmarks.csv'
MODEL_NAME = 'gesture_model' # Folder for the model

def train():
    if not os.path.exists(INPUT_CSV):
        print(f"Error: {INPUT_CSV} not found. Run extract_landmarks.py first.")
        return

    # 1. Load data
    df = pd.read_csv(INPUT_CSV)
    X = df.drop('label', axis=1).values.astype(np.float32)
    y_raw = df['label'].values
    
    # 2. Encode labels (A -> 0, B -> 1, etc.)
    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)
    num_classes = len(encoder.classes_)
    
    # 3. Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Create a more powerful Neural Network
    # 126 inputs -> 128 hidden -> 64 hidden -> 32 hidden -> num_classes output
    model = tf.keras.models.Sequential([
        tf.keras.layers.Input(shape=(126,)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.BatchNormalization(), # Stabilizes training
        tf.keras.layers.Dropout(0.2), # Prevents overfitting
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    
    # 5. Train for more epochs
    print(f"Training on {len(X_train)} samples...")
    model.fit(X_train, y_train, epochs=80, batch_size=16, validation_data=(X_test, y_test), verbose=1)
    
    # 6. Save Model & Labels
    if not os.path.exists(MODEL_NAME):
        os.makedirs(MODEL_NAME)
        
    model.save(f'{MODEL_NAME}/model.h5')
    
    # Save the labels so the app knows what 0, 1, 2... mean
    with open(f'{MODEL_NAME}/labels.txt', 'w') as f:
        for label in encoder.classes_:
            f.write(f"{label}\n")
            
    print(f"\nModel saved to {MODEL_NAME}/model.h5")
    print(f"Labels saved to {MODEL_NAME}/labels.txt")

if __name__ == "__main__":
    train()
