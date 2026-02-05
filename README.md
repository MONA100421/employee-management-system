# Employee Management System (EMS)

An internal Employee / HR portal for managing employee onboarding and visa status workflows.

This project focuses on **process-driven UI**, **role-based access control**, and **document approval workflows**, built with a modern React + Node.js stack.


## Features Overview

### Employee Features

* Secure login & persistent session
* Step-based onboarding application
* Upload and manage onboarding documents
* View onboarding status and HR feedback
* OPT / Visa document tracking (UI-complete)

### HR Features

* Role-based dashboard
* Review and approve onboarding applications
* Provide feedback on rejected applications
* View employee profiles and submitted documents
* Visa status management (UI-complete, backend partially implemented)

## 🧱 Tech Stack

### Frontend

* **React + TypeScript**
* **MUI (Material UI)**
* **React Router v6**
* **Context API** for authentication
* **Vite** for development & build

### Backend

* **Node.js + Express**
* **MongoDB + Mongoose**
* RESTful API architecture
* Role-based authorization middleware

## UI Design System

The UI follows an **enterprise HR system design** philosophy:

* Neutral color palette with high readability
* Card-based layout for information density
* Stepper-driven workflows for onboarding and visa processes
* Status-driven UI using reusable `StatusChip` components

## Authentication & Authorization

### Roles

* `employee`
* `hr`

### Auth Flow

* Login via username/password
* Auth state persisted in `localStorage`
* Protected routes enforced via:

  * `RequireAuth`
  * `RequireRole`

---

## 🧭 Application Routing

### Public Routes

```
/login
```

### Employee Routes

```
/employee/dashboard
/employee/onboarding
```

### HR Routes

```
/hr/dashboard
/hr/employees
/hr/onboarding/:id
```

## Core Workflows

### Employee Onboarding

A **multi-step onboarding process**:

1. Personal Information
2. Address & Emergency Contact
3. Work Authorization
4. Document Upload
5. Review & Submit

Supported onboarding statuses:

* `never-submitted`
* `pending`
* `approved`
* `rejected`

Rejected applications include **HR feedback**, and employees can resubmit after fixing issues.

### Document Upload & Review

Employees upload required documents:

* Driver’s License / State ID
* Work Authorization
* Profile Photo

Each document has its own UI state:

* `not-started`
* `pending`
* `approved`
* `rejected`

Rejected documents visually highlight the issue and guide the user to re-upload.

---

### HR Onboarding Review

HR users can:

* View all onboarding applications
* Approve or reject applications
* Provide mandatory feedback on rejection
* Review full employee profiles before decision

Approval decisions are persisted in the backend.

### Visa Status Management (OPT-focused)

#### Employee View

* Step-by-step visa process visualization
* Sequential document upload enforcement
* Clear status indicators and progress tracking

#### HR View

* In-progress visa cases
* Document preview, approval, or rejection
* Reminder/notification actions (UI-ready)

## Project Structure

### Frontend

```
src/
├── components/
│   ├── common/          # ConfirmDialog, FeedbackDialog, FileUpload, StatusChip
│   ├── layout/          # AppLayout
│   └── ui/              # Shared UI primitives
├── contexts/            # AuthContext, AuthProvider
├── pages/
│   ├── auth/
│   ├── employee/
│   └── hr/
├── routes/              # Route guards
├── theme/               # MUI theme
└── lib/                 # API helpers
```

### Backend

```
src/
├── controllers/
│   ├── authController.ts
│   ├── onboardingController.ts
│   └── hrController.ts
├── models/
│   ├── User.ts
│   ├── OnboardingApplication.ts
│   ├── RegistrationToken.ts
│   └── Document.ts      # (planned)
├── routes/
├── utils/
│   └── authMiddleware.ts
```
