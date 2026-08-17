# MediPulse 360 – 5-Minute YouTube Video Demonstration Script (Deliverable D3)

**Author**: [Your Name]  
**Assessment**: PUSL3120 Full-Stack Development Coursework (100%)  
**Maximum Allowed Length**: Exactly 5 Minutes (0:00 to 5:00)  
**Format**: Screen recording narrated by your real voice (AI voice generation is prohibited by the brief).  
**YouTube Setting**: Upload as **Unlisted**.

---

## Video Timeline & Narration Breakdown

```
[0:00 - 0:40] Introduction & Architecture Overview (40s)
[0:40 - 1:40] Patient Experience: Specialist Search, Live Slot Picker & Booking (60s)
[1:40 - 2:30] WebSockets Live Demonstration: Real-Time Sync & Live Chat (50s)
[2:30 - 3:30] Doctor Portal: Queue Management, Medical Record & Rx Creation (60s)
[3:30 - 4:15] Admin Portal: Department CRUD, Doctor Roster & Revenue KPIs (45s)
[4:15 - 5:00] DevOps, Automated Testing & CI/CD Pipeline Execution (45s)
```

---

### [0:00 - 0:40] 1. Introduction & Full-Stack Architecture
- **On Screen**: Show the homepage (`http://localhost:5173`) with live WebSocket indicator (green dot).
- **Spoken Narration**:
  > *"Hello, my name is [Your Name], and this is my submission for the PUSL3120 Full-Stack Development module. I have developed **MediPulse 360**, a real-time, distributed clinic and hospital management platform built on the MERN stack—comprising a React frontend with dynamic routing, a Node.js and Express backend, Socket.io WebSockets, and a MongoDB database with full containerization support via Docker Compose.*
  > *The system implements Role-Based Access Control across three core user types: Patients, Doctors, and Hospital Administrators, with full CRUD functionality across Users, Departments, Appointments, and Medical Records."*

---

### [0:40 - 1:40] 2. Patient Experience: Interactive 4-Step Booking Flow
- **On Screen**: Click "Book Appointment", navigate through the 4-step wizard:
  1. Filter by "Dental Surgery" or "Cardiology" and select Dr. Sarah Jenkins.
  2. Pick tomorrow's date and select the "10:00" time slot in the real-time slot grid.
  3. Choose "Live Tele-Consultation", select symptom tags, and enter the consultation reason.
  4. Submit booking -> show celebratory confetti and booking reference.
- **Spoken Narration**:
  > *"Starting as a patient, we can browse medical specialties and certified practitioners. In our multi-step booking wizard, we select a specialist like Dr. Sarah Jenkins. The calendar fetches live time slots from the server.*
  > *When we select a slot and confirm the booking, the appointment is created with conflict-detection preventing double-bookings, and an instant WebSocket broadcast is dispatched."*

---

### [1:40 - 2:30] 3. WebSockets Real-Time Demonstration & Live Consultation Chat
- **On Screen**: Open two browser windows side-by-side (Window 1: Patient Jane Doe, Window 2: Doctor Dr. Sarah Jenkins). Open "Live Chat" on both. Send a message from the patient, show it appear instantaneously on the doctor screen with typing indicator.
- **Spoken Narration**:
  > *"To demonstrate our mandatory WebSockets implementation, I have two sessions open side-by-side. Notice the real-time consultation room: when the patient types and sends a clinical query, the message arrives instantaneously on the doctor's screen without page refresh.*
  > *Furthermore, if an appointment is rescheduled or cancelled, the slot availability updates immediately across all connected clients via WebSocket event broadcasting."*

---

### [2:30 - 3:30] 4. Doctor Portal: Clinical Records & Printable Prescriptions
- **On Screen**: In the Doctor session, switch to "Today's Agenda". Click "Clinical Record" on an appointment.
  - Fill in clinical vitals (BP: 120/80, Heart rate: 72 bpm, Temp: 36.8°C).
  - Add medication items (e.g. Amoxicillin 500mg, Twice daily, 7 days).
  - Submit -> shows status change to "Completed".
  - Click "View Rx Sheet / Print" to demonstrate the clean printable prescription modal.
- **Spoken Narration**:
  > *"Switching to the Doctor Portal, practitioners have complete visibility over their daily patient queue. After a consultation, the doctor can launch the clinical record builder to record patient vitals, diagnosis, and structured prescriptions with dosage and frequency.*
  > *Submitting this record marks the visit completed and generates an official printable prescription that patients can download or print directly."*

---

### [3:30 - 4:15] 5. Administrator Portal: Department CRUD & Doctor Roster
- **On Screen**: Use 1-Click Demo Login to switch to Eleanor Vance (Admin).
  - Show KPI cards (Total Consultations, Revenue, Doctors, Patients).
  - Click "Add Specialty" -> create "Ophthalmology" (`OPHTH`).
  - Click "Add Doctor" -> show doctor creation form.
  - Show the live search filtering in the Master Appointments table.
- **Spoken Narration**:
  > *"In the Administrative Portal, hospital management has comprehensive oversight of operations, patient volume, and revenue analytics.*
  > *Administrators can perform full CRUD operations on clinical specialties and onboard new medical doctors with custom consultation fees and assigned departments."*

---

### [4:15 - 5:00] 6. DevOps, Automated Testing & CI/CD Pipeline
- **On Screen**:
  - Terminal showing `npm test` passing unit and integration tests in `server`.
  - Show `.github/workflows/ci.yml` and `docker-compose.yml`.
- **Spoken Narration**:
  > *"Finally, looking at our DevOps pipeline, we have implemented automated unit and integration tests using Jest and Supertest, validating cryptographic password hashing, token validation, and route security.*
  > *Our automated GitHub Actions CI/CD pipeline triggers on every push, executing backend tests against a MongoDB service container, building client production assets, and verifying Docker multi-container configurations.*
  > *Thank you for watching this presentation of MediPulse 360."*
