import numpy as np
import random
import os

def create_random_2d_array_with_bands():
    """Create a random size 2D array with random band patterns"""
    # Random size between 20x20 and 200x200
    rows = [16,32,64,128][random.randint(0,3)]
    cols = random.randint(600, 1440)
    
    # Create base random data
    data = np.random.rand(8,rows, cols)
    
    # Add random number of bands (between 2 and 8)
    num_bands = random.randint(2, 8)
    
    for _ in range(num_bands):
        band_type = random.choice(['horizontal', 'vertical', 'diagonal', 'block'])
        
        if band_type == 'horizontal':
            # Random horizontal band
            start_row = random.randint(0, rows - 10)
            end_row = random.randint(start_row + 1, min(start_row + 20, rows))
            intensity = random.uniform(0.2, 0.8)
            data[:,start_row:end_row, :] += intensity
            
        elif band_type == 'vertical':
            # Random vertical band
            start_col = random.randint(0, cols - 10)
            end_col = random.randint(start_col + 1, min(start_col + 20, cols))
            intensity = random.uniform(0.2, 0.8)
            data[:,:, start_col:end_col] += intensity
            
        elif band_type == 'diagonal':
            # Random diagonal pattern
            start_pos = random.randint(0, min(rows, cols) - 10)
            length = random.randint(5, min(20, min(rows, cols) - start_pos))
            intensity = random.uniform(0.2, 0.8)
            for i in range(length):
                if start_pos + i < min(rows, cols):
                    data[:,start_pos + i, start_pos + i] += intensity
                    
        elif band_type == 'block':
            # Random rectangular block
            start_row = random.randint(0, rows - 15)
            end_row = random.randint(start_row + 5, min(start_row + 25, rows))
            start_col = random.randint(0, cols - 15)
            end_col = random.randint(start_col + 5, min(start_col + 25, cols))
            intensity = random.uniform(0.2, 0.8)
            data[:,start_row:end_row, start_col:end_col] += intensity
    
    return data

def create_multiple_arrays(n=5):
    script_directory = os.path.dirname(os.path.abspath(__file__))

    """Create n random 2D arrays with random bands"""
    arrays = []
    
    for i in range(n):
        print(f"Creating array {i+1}/{n}...")
        data = create_random_2d_array_with_bands()
        
        # Save individual array
        filename = f'array_8_bands_{i+1}.npy'
        np.save(os.path.join(script_directory, filename), data)
        
        arrays.append({
            'data': data,
            'filename': filename,
            'shape': data.shape,
            'min': float(np.min(data)),
            'max': float(np.max(data))
        })
        
        print(f"  Saved {filename} with shape {data.shape}")
        print(f"  Data range: {np.min(data):.3f} to {np.max(data):.3f}")
    
    # Save a combined file with all arrays
    np.save(os.path.join(script_directory, 'all_arrays.npy'), arrays)
    print(f"\nSaved all {n} arrays to 'all_arrays.npy'")
    
    return arrays

if __name__ == "__main__":
    # Create 5 random arrays by default
    n_arrays = 5
    print(f"Creating {n_arrays} random 2D arrays with random bands...")
    arrays = create_multiple_arrays(n_arrays)
    
    print(f"\nSummary:")
    for i, arr in enumerate(arrays):
        print(f"Array {i+1}: {arr['filename']} - Shape: {arr['shape']} - Range: {arr['min']:.3f} to {arr['max']:.3f}") 