# Academy Flow Workspace

This repository is organized into two separate folders:
1. **Frontend**: Located in [frontend/](file:///c:/Users/akhil/Desktop/ACADEMY/Tution_Academy_Flow_full/frontend/) (Vite + React + TypeScript)
2. **Backend**: Located in [backend/](file:///c:/Users/akhil/Desktop/ACADEMY/Tution_Academy_Flow_full/backend/) (Node.js + Express + MongoDB)

## 🚀 Quick Start

### 1. Install Dependencies
You can install dependencies for both the frontend and backend at once by running this command in the project root:
```bash
npm run install:all
```

### 2. Configure Environment Variables
- **Backend**: Go to the `backend/` directory, copy `.env.example` to `.env`, and fill in your database connection details (specifically `MONGODB_URI`).
- **Frontend**: Go to the `frontend/` directory, copy `.env.example` to `.env`, and customize details if needed.

### 3. Run the Services
You can run the frontend and backend servers directly from the project root:
- **Run Backend**: `npm run dev:backend` (Starts the server on http://localhost:5000)
- **Run Frontend**: `npm run dev:frontend` (Starts the Vite development server on http://localhost:3000 or http://localhost:5173)

---

For detailed setup options and verification, please refer to the [Setup Guide](file:///c:/Users/akhil/Desktop/ACADEMY/Tution_Academy_Flow_full/SETUP_GUIDE.md).
