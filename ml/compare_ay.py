import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import os

# Hand connection map
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),    # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),    # Index
    (0, 9), (9, 10), (10, 11), (11, 12), # Middle
    (0, 13), (13, 14), (14, 15), (15, 16), # Ring
    (0, 17), (17, 18), (18, 19), (19, 20)  # Pinky
]

def visualize_specific_labels(csv_path, labels_to_show=['A', 'Y'], output_image='ml/compare_ay.png'):
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # Filter for A and Y
    fig = plt.figure(figsize=(15, 10))
    
    plot_idx = 1
    for label in labels_to_show:
        # Get 2 samples for each label
        samples = df[df['label'] == label].sample(min(2, len(df[df['label'] == label])))
        
        for index, row in samples.iterrows():
            ax = fig.add_subplot(2, 2, plot_idx, projection='3d')
            plot_idx += 1
            
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
            
            ax.set_title(f"Label: {label} (Sample {index})")
            ax.view_init(elev=-90, azim=-90) # Top-down view
            
            # Add a small legend to distinguish hands
            ax.legend(loc='upper right', fontsize='small')

    plt.tight_layout()
    plt.savefig(output_image)
    print(f"Comparison saved to {output_image}!")

if __name__ == "__main__":
    visualize_specific_labels('landmarks.csv')
