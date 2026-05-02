import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

# Hand connection map (tells the plotter which dots to connect)
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),    # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),    # Index
    (0, 9), (9, 10), (10, 11), (11, 12), # Middle
    (0, 13), (13, 14), (14, 15), (15, 16), # Ring
    (0, 17), (17, 18), (18, 19), (19, 20)  # Pinky
]

def visualize_sample(csv_path, output_image='ml/hand_check.png'):
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # Pick 4 random samples to show
    samples = df.sample(min(4, len(df)))
    
    fig = plt.figure(figsize=(12, 10))
    
    for i, (index, row) in enumerate(samples.iterrows()):
        ax = fig.add_subplot(2, 2, i+1, projection='3d')
        
        # Plot Right Hand (Blue)
        xr = [row[f'x{j}_right'] for j in range(21)]
        yr = [row[f'y{j}_right'] for j in range(21)]
        zr = [row[f'z{j}_right'] for j in range(21)]
        
        if any(v != 0 for v in xr + yr + zr):
            ax.scatter(xr, yr, zr, c='b', marker='o', label='Right Hand')
            for start_idx, end_idx in HAND_CONNECTIONS:
                ax.plot([xr[start_idx], xr[end_idx]], [yr[start_idx], yr[end_idx]], [zr[start_idx], zr[end_idx]], 'b-')
            
        # Plot Left Hand (Red)
        xl = [row[f'x{j}_left'] for j in range(21)]
        yl = [row[f'y{j}_left'] for j in range(21)]
        zl = [row[f'z{j}_left'] for j in range(21)]
        
        if any(v != 0 for v in xl + yl + zl):
            ax.scatter(xl, yl, zl, c='r', marker='o', label='Left Hand')
            for start_idx, end_idx in HAND_CONNECTIONS:
                ax.plot([xl[start_idx], xl[end_idx]], [yl[start_idx], yl[end_idx]], [zl[start_idx], zl[end_idx]], 'r-')
        
        ax.set_title(f"Label: {row['label']} (Row {index})")
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.view_init(elev=-90, azim=-90)

    plt.tight_layout()
    plt.savefig(output_image)
    print(f"Visualization saved to {output_image}!")

if __name__ == "__main__":
    visualize_sample('landmarks.csv')
