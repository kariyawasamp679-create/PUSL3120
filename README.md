# MediPulse 360 – Real-Time Clinic & Hospital Management System
**Module**: PUSL3120 Full-Stack Development (20-Credit Module)  
**Assessment**: 100% Coursework (Report D1, Code D2, Video D3)  
**Stack**: React 18, Node.js, Express, Socket.IO WebSockets, MongoDB, Docker

---

## 🌟 Key Features

1. **Multi-Role Role-Based Access Control (RBAC)**:
   - **Patient Portal**: Instant multi-step appointment booking, live slot picker, clinical history timeline, printable prescription downloads, real-time consultation chat.
   - **Doctor Portal**: Daily agenda & queue management, appointment status actions, digital clinical report authoring with vitals and structured prescriptions (Rx), live chat.
   - **Administrator Portal**: Hospital revenue & capacity analytics, department specialty CRUD, doctor roster management, master appointment oversight table with real-time search.
2. **Real-Time WebSockets (`socket.io`)**:
   - Double-booking prevention with instant cross-client slot locking.
   - Live doctor-patient consultation room messaging with typing indicators.
   - Real-time toast alerts on booking, status transitions, and newly issued prescriptions.
3. **4 Core CRUD Entities**:
   - `Users` (Patients, Doctors, Administrators)
   - `Departments` (Specialties: Cardiology, Dental, GP, Pediatrics, Orthopedics)
   - `Appointments` (In-person & Live Video Telehealth)
   - `MedicalRecords` (Clinical notes, vitals, multi-row medication prescriptions)
4. **DevOps, Testing & Multi-Container Deployment**:
   - Docker containerization (`Dockerfile` for client, `Dockerfile` for server, `docker-compose.yml`).
   - Automated CI/CD pipeline via GitHub Actions (`.github/workflows/ci.yml`).
   - Automated unit and integration testing suite (Jest & Supertest).
   - User Acceptance Testing Protocol (`UAT_TEST_CASES.md`).

---

## 🔑 Pre-Configured Demo Accounts (1-Click Login Available in App)

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Hospital Administrator** | Eleanor Vance | `admin@medipulse.com` | `Password123!` |
| **Cardiologist Doctor** | Dr. Sarah Jenkins | `dr.sarah@medipulse.com` | `Password123!` |
| **Dental Surgeon** | Dr. Marcus Vance | `dr.marcus@medipulse.com` | `Password123!` |
| **General Practitioner** | Dr. Emily Watson | `dr.emily@medipulse.com` | `Password123!` |
| **Patient (Jane)** | Jane Doe (Blood: A+) | `jane.doe@example.com` | `Password123!` |
| **Patient (John)** | John Smith (Blood: O+) | `john.smith@example.com` | `Password123!` |

> *Tip: You can use the **"Demo Roles"** button in the top navigation bar to switch between any user role with one click!*

---

## 🚀 Quick Start Guide

### Option 1: Local Development

1. **Install Dependencies**:
   ```bash
   npm install --workspace server
   npm install --workspace client
   ```

2. **Configure Environment Variables**:
   In `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/pusl3120
   JWT_SECRET=medipulse_super_secret_jwt_key_2026_pusl3120
   ```

3. **Seed Database with Demo Data**:
   ```bash
   npm run seed --workspace server
   ```

4. **Run Both Server and Client**:
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server & WebSockets: `http://localhost:5000`
   - API Health Check: `http://localhost:5000/api/health`

---

### Option 2: Multi-Container Deployment via Docker Compose

Run the entire full-stack system (Client + Server + MongoDB):
```bash
docker compose up --build
```
- Access Frontend Client: `http://localhost:5173`
- Access Backend API: `http://localhost:5000`

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite:
```bash
npm test --workspace server
```

---

## 📄 Coursework Deliverables Included

- **`REPORT_DRAFT.md`**: Complete, 2,000-word structured academic project report (Requirements, Design & UML, Testing & Code snippets, DevOps CI/CD, Evaluation).
- **`VIDEO_SCRIPT.md`**: 5-minute video demonstration script with timestamps and exact talking points for YouTube recording.
- **`UAT_TEST_CASES.md`**: 20-scenario User Acceptance Testing execution matrix and ethical compliance protocol.
- **`.github/workflows/ci.yml`**: Continuous Integration and automated test pipeline.
- **`docker-compose.yml`**: Distributed multi-container orchestration.

