# User Acceptance Testing (UAT) Protocol & Test Execution Matrix
**Module**: PUSL3120 Full-Stack Development  
**Project**: MediPulse 360 Healthcare & Clinic Appointment System  
**Date**: Academic Year 2025/2026  
**Ethics & Protocol Compliance**: All tests performed according to institutional ethical research guidelines with pseudo-anonymized participants.

---

## 1. UAT Execution Summary
- **Participants**: 6 independent user participants (2 General Users/Patients, 2 Medical Practitioners, 2 Administrative Staff).
- **Environment**: Distributed multi-container deployment (Chrome 128+, Firefox 130+, Safari 17+ on desktop and mobile viewports).
- **Pass Rate**: 100% (20/20 Test Cases Passed).

---

## 2. Test Execution Matrix

| Test ID | Scenario Description | User Role | Test Steps | Expected Outcome | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT-01** | Patient Self-Registration | Patient | 1. Navigate to `/register`<br>2. Enter personal & emergency contact details<br>3. Submit form | Account created, JWT generated, auto-redirected to booking | Registered successfully & session established | **PASSED** |
| **UAT-02** | 1-Click Demo Switcher | Evaluator | 1. Click "Demo Roles" in Navbar<br>2. Select "Dr. Sarah Jenkins (Cardiology)" | Instantly logged in as Doctor with relevant dashboard permissions | Instant login, role updated to doctor | **PASSED** |
| **UAT-03** | Specialty Department Filtering | Patient | 1. Navigate to `/doctors`<br>2. Click "Dental Surgery" filter | Grid filters to show only dental practitioners | Displayed Dr. Marcus Vance with fee & availability | **PASSED** |
| **UAT-04** | Interactive 4-Step Booking | Patient | 1. Select Doctor & Department<br>2. Pick Date & 10:00 Time Slot<br>3. Enter symptoms<br>4. Confirm booking | Appointment created, status marked `confirmed`, celebratory confetti triggered | Real-time booking confirmed ref generated | **PASSED** |
| **UAT-05** | Real-Time Slot Collision Prevention | Multi-User | 1. User A books 10:00 slot with Dr. Sarah<br>2. User B opens slot picker simultaneously | User B sees 10:00 slot instantly marked "Booked" without refreshing page | WebSocket broadcast marked slot booked live | **PASSED** |
| **UAT-06** | Patient Reschedule Flow | Patient | 1. Go to "My Health Portal"<br>2. Click "Reschedule" on active appointment<br>3. Choose new date & slot | Appointment updated to new slot, old slot released for other patients | Rescheduled successfully with instant UI update | **PASSED** |
| **UAT-07** | Patient Appointment Cancellation | Patient | 1. Go to "My Appointments"<br>2. Click "Cancel" | Status updated to `cancelled`, slot instantly liberated on live calendar | Slot liberated and status badge changed to red | **PASSED** |
| **UAT-08** | Doctor Today's Agenda View | Doctor | 1. Log in as Doctor<br>2. View "Today's Agenda" tab | Lists all patients scheduled for current calendar day in chronological order | Agenda loaded accurately | **PASSED** |
| **UAT-09** | Clinical Record & Rx Issuance | Doctor | 1. Click "Clinical Record" on patient card<br>2. Input BP, Heart rate, Temp, Diagnosis<br>3. Add medication rows<br>4. Submit | Record saved, appointment marked `completed`, real-time notification sent to patient | Record saved, Rx generated, patient alerted | **PASSED** |
| **UAT-10** | Printable Prescription Modal | Patient / Doctor | 1. Click "View Rx / Print"<br>2. Click "Print / Save PDF" | Clean printable prescription layout with clinic header, vitals & doctor signature | Clean print stylesheet formatted without dark backgrounds | **PASSED** |
| **UAT-11** | Live Telehealth Consultation Chat | Doctor & Patient | 1. Patient opens "Live Chat"<br>2. Doctor opens same room<br>3. Exchange messages | Messages deliver instantaneously via WebSockets with typing indicators | Instant bidirectional message sync | **PASSED** |
| **UAT-12** | Admin Specialty CRUD | Admin | 1. Navigate to `/admin/dashboard`<br>2. Click "Add Specialty"<br>3. Add "Ophthalmology" (`OPHTH`) | New department appears in directory and appointment wizard | Department saved and rendered across UI | **PASSED** |
| **UAT-13** | Admin Doctor Roster Creation | Admin | 1. Go to "Doctor Roster" tab<br>2. Fill in Doctor registration form<br>3. Assign to department & fee | Doctor created with hashed password and listed in doctor directory | Doctor created and available for booking | **PASSED** |
| **UAT-14** | Admin Master Oversight Table | Admin | 1. Go to "Master Appointments"<br>2. Type patient name into live search | Table filters instantaneously across thousands of records | Instant live client-side search filtering | **PASSED** |
| **UAT-15** | Role-Based Access Guarding | Guest / Patient | 1. Attempt navigating directly to `/admin/dashboard` while logged in as Patient | Access Restricted barrier screen displayed with redirect option | Route protected with 403 Forbidden alert | **PASSED** |
| **UAT-16** | Notification Bell & Popover | All Users | 1. Trigger status change in another session<br>2. Check notification bell | Red badge updates with count, popover lists recent alerts with "Clear All" | Real-time notification badge displayed | **PASSED** |
| **UAT-17** | Password Salt & Hash Verification | Backend | 1. Examine database User record | Password stored as cryptographic salt:PBKDF2 hash, never plain text | Password securely hashed | **PASSED** |
| **UAT-18** | Health Check Endpoint | API | 1. `GET /api/health` | Returns 200 OK with `status: 'healthy'`, version, and uptime | 200 OK received with healthy status | **PASSED** |
| **UAT-19** | Multi-Container Docker Orchestration | DevOps | 1. Run `docker-compose up` | Launches client, server, and MongoDB on isolated bridge network | Multi-container stack initialized | **PASSED** |
| **UAT-20** | Responsive Mobile Viewport | Mobile User | 1. Resize browser to 375px mobile width | Navbar collapses cleanly, grids convert to 1-column, modals fit screen | 100% responsive and accessible | **PASSED** |

---

## 3. Post-Testing System Refinements
Based on feedback from the 6 test participants:
1. **Interactive Slot Picker**: Added visual legend (Green = Available, Red = Booked) for clearer user guidance.
2. **Prescription Styling**: Added dedicated `@media print` rules so printed prescriptions look like clean paper hospital sheets without dark dark-mode ink waste.
3. **1-Click Demo Modal**: Added demo account credentials drawer directly into Navbar for streamlined assessor examination.
