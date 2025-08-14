ELTA UI

Electron + React (Vite) desktop app with a FastAPI backend. The backend serves CSV and NumPy data for visualization; the frontend runs in Electron for a desktop experience.

## Prerequisites
- Node.js 18+ (recommend LTS)
- Python 3.10+
- Windows PowerShell, macOS Terminal, or Linux shell

## Project Structure
```
elta-ui/
  backend/               # FastAPI app and sample data
  frontend/              # Electron + Vite + React app
```

## Setup
### Backend (FastAPI)
1. Create and activate a virtual environment
   - Windows (PowerShell)
     ```powershell
     cd backend
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - macOS/Linux
     ```bash
     cd backend
     python3 -m venv .venv
     source .venv/bin/activate
     ```
2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

### Frontend (Electron + Vite + React)
```bash
cd frontend
npm install
```

## Development
Open two terminals.

- Backend (terminal 1)
  - Option A (recommended):
    ```bash
    cd backend
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
  - Option B:
    ```bash
    cd backend
    python main.py
    ```
  The API will be available at `http://localhost:8000`.

- Frontend (terminal 2)
  ```bash
  cd frontend
  npm run dev
  ```
  This starts Vite on port 5173 and launches Electron pointing at the dev server.

### Windows: fix "uvicorn not recognized"
If you see `uvicorn: The term 'uvicorn' is not recognized`, ensure your virtual environment is activated and run uvicorn via Python:

```powershell
cd backend
python -m venv .venv
 .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Building the Desktop App
From `frontend/`:
```bash
npm run build
```
This builds the renderer (Vite) and packages the Electron app via electron-builder. The output installer/binaries are created under the default electron-builder output directory (e.g., `dist/` or `release/`).

## API Overview
Base URL: `http://localhost:8000`

- `GET /` → health/info
- `GET /csv?filename=data.csv` → returns rows from a CSV in `backend/sample_data/`
- `GET /load-numpy-file?filename=sample_data.npy` → loads a `.npy` file from `backend/sample_data/`
- `GET /list-numpy-files` → lists `.npy` files in `backend/sample_data/` (expects 3D arrays)
- `GET /load-array/{array_index}` → loads an entry by index from `backend/sample_data/all_arrays.npy`

## Sample Data
- CSV: Place files (e.g., `data.csv`) into `backend/sample_data/`.
- NumPy: Place `.npy` files into `backend/sample_data/`. For `list-numpy-files`, files should be 3D arrays (e.g., `[channels, rows, cols]`).
- A helper script exists at `backend/sample_data/create_sample_data.py` to generate arrays. If you use it, update or remove the hardcoded CSV path near the top before running (it is not used elsewhere but will error if the file is missing).

Run (after fixing the path if needed):
```bash
cd backend/sample_data
python create_sample_data.py
```
This creates `array_*.npy` files and an `all_arrays.npy` bundle in the same directory.

## Troubleshooting
- Electron window doesn’t open in dev: ensure `npm run dev` is running and port 5173 is free.
- Frontend can’t reach backend: confirm the backend is running at `http://localhost:8000` and CORS is enabled (it is, in `backend/main.py`).
- Packaging issues on Windows: electron-builder may require additional tooling (e.g., NSIS) to create installers.

## License
ISC


