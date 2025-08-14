from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import csv
import os
import numpy as np
import glob
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "PU 12345"}


@app.get("/csv")
def get_csv(filename: str = "data.csv"):
    csv_file = os.path.join(os.path.dirname(__file__), "sample_data", filename)
    rows = []
    with open(csv_file, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return {"rows": rows}

@app.get("/load-numpy-file")
def load_numpy_file(filename: str = "sample_data.npy"):
    """Load a numpy file and return its data for heatmap visualization"""
    try:
        file_path = os.path.join(os.path.dirname(__file__),'sample_data', filename)
        if os.path.exists(file_path):
            data = np.load(file_path, allow_pickle=True)
            return {
                "data": data.tolist(),
                "shape": data.shape,
                "min": float(np.min(data)),
                "max": float(np.max(data)),
                "filename": filename
            }
        else:
            return {"error": f"File {filename} not found"}
    except Exception as e:
        return {"error": f"Error loading file: {str(e)}"}

@app.get("/list-numpy-files")
def list_numpy_files():
    """List all available numpy files in the backend directory"""
    try:
        backend_dir = os.path.dirname(__file__)
        numpy_files = glob.glob(os.path.join(backend_dir, "sample_data", "*.npy"))
        
        files_info = []
        for file_path in numpy_files:
            filename = os.path.basename(file_path)            
            data = np.load(file_path, allow_pickle=True)
            if not isinstance(data, np.ndarray):
                continue
            if len(data.shape) != 3:
                print(f"Skipping {filename} because it is not a 3D array")
                continue
            files_info.append({
                "filename": filename,
                "shape": data.shape,
                "size_mb": os.path.getsize(file_path) / (1024 * 1024)
            })
        return {"files": files_info}
    except Exception as e:
        return {"error": f"Error listing files: {str(e)}"}

@app.get("/load-array/{array_index}")
def load_array_by_index(array_index: int):
    """Load a specific array from the all_arrays.npy file"""
    try:
        file_path = os.path.join(os.path.dirname(__file__), "sample_data", "all_arrays.npy")
        if os.path.exists(file_path):
            all_arrays = np.load(file_path, allow_pickle=True)
            if array_index < len(all_arrays):
                array_data = all_arrays[array_index]
                return {
                    "data": array_data['data'].tolist(),
                    "shape": array_data['shape'],
                    "min": array_data['min'],
                    "max": array_data['max'],
                    "filename": array_data['filename'],
                    "array_index": array_index
                }
            else:
                return {"error": f"Array index {array_index} out of range. Available: 0-{len(all_arrays)-1}"}
        else:
            return {"error": "all_arrays.npy file not found"}
    except Exception as e:
        return {"error": f"Error loading array: {str(e)}"}

if __name__ == "__main__":    
    uvicorn.run(app, host="0.0.0.0", port=8000)
