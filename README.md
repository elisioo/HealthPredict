# HealthPredict

HealthPredict is a web application for diabetes risk prediction and patient management. It combines a Node.js/Express backend, a React frontend, a MySQL database, and a Python-based machine learning prediction script to support risk screening, secure user accounts, appointment handling, messaging, and administrative reporting.

## System Overview

The system is organized as a client-server application:

- The frontend provides the user interface for guests, patients, healthcare staff, and administrators.
- The backend exposes REST APIs for authentication, profiles, predictions, appointments, messaging, reports, and admin operations.
- The database stores user records, health profiles, prediction history, appointments, and related application data.
- The ML training and prediction scripts support diabetes risk scoring.

## Key Capabilities

- User registration, login, password recovery, and role-based access control
- Health profile management and diabetes risk predictions
- Patient-to-staff messaging and appointment scheduling
- Admin dashboards, user management, reports, and system monitoring
- Security controls such as input sanitization, rate limiting, JWT-based sessions, and encrypted sensitive data handling

## Project Structure

- `backend/` - Express API, controllers, middleware, database access, services, and ML integration
- `frontend/` - React single-page application and UI components
- `SECURITY_DOCUMENTATION.md` - Security and hardening reference for the system
- `credentials.txt` - Local sensitive configuration reference; keep out of version control

## Getting Started

Install dependencies in the root, backend, and frontend folders, then run the development script from the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

The root `dev` script starts the backend and frontend together.

## Environment Notes

The application expects database, JWT, encryption, and other runtime settings to be provided through environment variables. See the backend configuration and security documentation for the full list of required values and defaults.

## Additional Documentation

- `SECURITY_DOCUMENTATION.md` contains a detailed system and security overview.
- `frontend/README.md` contains the default frontend tooling notes from Create React App.