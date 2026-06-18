# CareerConnect Pro

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![React](https://img.shields.io/badge/react-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

**CareerConnect Pro** is a full-stack, enterprise-level Job Portal and Recruitment Management Platform.

It connects **Job Seekers**, **Recruiters**, and **Administrators** in a secure role-based system that covers the complete hiring lifecycle, including profile management, resume uploads, job posting, job applications, interviews, subscriptions, payments, reviews, notifications, analytics, audit logs, moderation, and business intelligence.

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Backend Setup](#backend-setup)
8. [Frontend Setup](#frontend-setup)
9. [Running the Application](#running-the-application)
10. [Important Routes](#important-routes)
11. [API Documentation](#api-documentation)
12. [Testing Guide](#testing-guide)
13. [Deployment Notes](#deployment-notes)
14. [Screenshots](#screenshots)
15. [Future Enhancements](#future-enhancements)
16. [License](#license)

---

## About the Project

CareerConnect Pro is designed to digitize and automate the recruitment workflow.

The platform supports three major user roles:

### Job Seeker

Job Seekers can create profiles, upload resumes, add skills, education, and experience, search for jobs, save jobs, apply for jobs, track applications, attend interviews, receive notifications, and get resume guidance.

### Recruiter

Recruiters can create and manage recruiter profiles, post jobs, manage candidates, shortlist or reject applications, schedule interviews, manage online interviews, subscribe to plans, view payment history, and track hiring analytics.

### Admin

Admins can manage users, verify companies, verify recruiters, manage job categories, manage subscription plans, moderate platform content, view audit logs, and access business intelligence reports.

---

## Key Features

## Authentication and RBAC

* User registration and login
* JWT-based authentication
* Forgot password and reset password flow
* Role-based access control
* Protected frontend routes
* Protected backend APIs

Supported roles:

* `JOB_SEEKER`
* `RECRUITER`
* `ADMIN`

---

## Profile Management

* User profile management
* Resume upload and download
* Set current resume
* Skills management
* Education management
* Experience management
* Role-based dashboard redirection

---

## Job Management

* Recruiters can create jobs
* Recruiters can update jobs
* Recruiters can activate or deactivate jobs
* Admins can view and manage jobs
* Job categories support
* Job detail page
* Job search and filtering
* Save and unsave jobs
* Job recommendations

---

## Applications and Candidate Pipeline

* Job seekers can apply to jobs
* Resume attachment during application
* Application status tracking
* Recruiters can view candidates
* Shortlist candidates
* Reject candidates
* Interview scheduling
* Application dashboard
* Candidate pipeline tracking

---

## Interviews

* Recruiters can schedule interviews
* Job seekers can view interview schedules
* Online interview management
* Interview notes and feedback support
* Role-based interview views

---

## Notifications and Messaging

* Notification system
* Unread notification count
* Messaging between users
* Conversation list
* Unread message count
* Header notification and message badges

---

## Subscriptions and Payments

* Subscription plans
* Recruiter plan selection
* Mock checkout support
* Payment history
* Invoice view
* Admin plan management

---

## Reviews and Ratings

* Company reviews
* Recruiter reviews
* Average rating display
* Review count display
* Reviewer name display
* Review form for company or recruiter

---

## Admin Tools

* Admin dashboard
* Manage users
* Activate or deactivate users
* Verify companies
* Verify recruiters
* Manage job categories
* Manage subscription plans
* Admin moderation
* Audit logs
* Business intelligence dashboard

---

## Analytics and Reports

### Recruiter Analytics

* Job posting analytics
* Hiring funnel
* Candidate analytics
* Applications per month
* Top jobs by applications
* Application status distribution

### Admin Analytics

* Platform-wide analytics
* Job posting trends
* Hiring analytics
* Candidate analytics
* Business intelligence reports

---

## Module 30: Business Intelligence Dashboard

The Business Intelligence Dashboard provides platform-level insights for admins.

### Features

* Top hiring companies
* Most applied jobs
* Revenue analytics
* Monthly growth reports
* Platform performance metrics
* Conversion rate
* Shortlist rate
* Average time to hire
* Active jobs count
* Total users, jobs, applications, companies, and recruiters

---

## AI Career Assistant

* Rule-based AI assistant
* Resume guidance
* Interview preparation advice
* Skill improvement suggestions
* Career growth tips

---

## Tech Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Frontend         | React 18 with Vite   |
| Styling          | Tailwind CSS         |
| HTTP Client      | Axios                |
| Notifications    | React Toastify       |
| Backend          | Python 3.9+          |
| API Framework    | FastAPI              |
| ORM              | SQLAlchemy           |
| Database         | MySQL 8.0            |
| Authentication   | JWT                  |
| Password Hashing | bcrypt               |
| API Docs         | Swagger UI and ReDoc |

---

## Project Structure

```txt
careerconnect-pro/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── middleware.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── resume.py
│   │   │   ├── skill.py
│   │   │   ├── education.py
│   │   │   ├── experience.py
│   │   │   ├── company.py
│   │   │   ├── recruiter.py
│   │   │   ├── job.py
│   │   │   ├── job_category.py
│   │   │   ├── application.py
│   │   │   ├── interview.py
│   │   │   ├── notification.py
│   │   │   ├── message.py
│   │   │   ├── plan.py
│   │   │   ├── payment.py
│   │   │   ├── review.py
│   │   │   ├── report.py
│   │   │   └── audit_log.py
│   │   │
│   │   ├── schemas/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── profiles.py
│   │   │   ├── resumes.py
│   │   │   ├── skills.py
│   │   │   ├── education.py
│   │   │   ├── experience.py
│   │   │   ├── companies.py
│   │   │   ├── recruiters.py
│   │   │   ├── jobs.py
│   │   │   ├── job_categories.py
│   │   │   ├── applications.py
│   │   │   ├── interviews.py
│   │   │   ├── notifications.py
│   │   │   ├── messages.py
│   │   │   ├── plans.py
│   │   │   ├── subscriptions.py
│   │   │   ├── payments.py
│   │   │   ├── reviews.py
│   │   │   ├── analytics.py
│   │   │   ├── reports.py
│   │   │   ├── audit_logs.py
│   │   │   └── admin.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── jobs/
│   │   │   ├── recruiter/
│   │   │   ├── admin/
│   │   │   ├── reviews/
│   │   │   ├── analytics/
│   │   │   ├── communication/
│   │   │   └── ai/
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md
└── .gitignore
```

---

## Getting Started

### Prerequisites

Install the following tools:

* Python 3.9+
* pip
* Node.js 18+
* npm
* MySQL 8.0+
* Git

---

## Environment Variables

Create a `.env` file inside the `backend/` folder.

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/careerconnect

SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=10

UPLOAD_DIR=uploads
```

Replace:

```txt
your_password
```

with your MySQL password.

Replace:

```txt
your_super_secret_key_here
```

with a secure random secret key.

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment.

### Windows

```cmd
venv\Scripts\activate
```

### Linux or macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE careerconnect;
```

Start backend server:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```txt
http://localhost:8000
```

Swagger docs:

```txt
http://localhost:8000/docs
```

ReDoc:

```txt
http://localhost:8000/redoc
```

---

## Frontend Setup

Go to frontend folder:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## Running the Application

Start backend:

```bash
cd backend
uvicorn app.main:app --reload
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open:

```txt
http://localhost:5173
```

---

## Important Routes

### Public Routes

| Page            | Route              |
| --------------- | ------------------ |
| Home            | `/`                |
| Login           | `/login`           |
| Register        | `/register`        |
| Forgot Password | `/forgot-password` |
| Reset Password  | `/reset-password`  |

### Common Protected Routes

| Page          | Route            |
| ------------- | ---------------- |
| Dashboard     | `/dashboard`     |
| Profile       | `/profile`       |
| Resumes       | `/resumes`       |
| Skills        | `/skills`        |
| Education     | `/education`     |
| Experience    | `/experience`    |
| Jobs          | `/jobs`          |
| Job Details   | `/jobs/:id`      |
| Companies     | `/companies`     |
| Notifications | `/notifications` |
| Messages      | `/messages`      |
| AI Assistant  | `/ai-assistant`  |

### Job Seeker Routes

| Page                  | Route                    |
| --------------------- | ------------------------ |
| Job Seeker Dashboard  | `/dashboard`             |
| Apply Job             | `/apply/:jobId`          |
| My Applications       | `/applications`          |
| Application Dashboard | `/application-dashboard` |
| Saved Jobs            | `/saved-jobs`            |
| My Interviews         | `/my-interviews`         |
| Recommendations       | `/recommendations`       |
| Resume Tips           | `/resume-tips`           |

### Recruiter Routes

| Page                | Route                  |
| ------------------- | ---------------------- |
| Recruiter Profile   | `/recruiter-profile`   |
| Recruiter Dashboard | `/recruiter-dashboard` |
| Hiring Dashboard    | `/hiring-dashboard`    |
| Manage Jobs         | `/manage-jobs`         |
| Candidates          | `/candidates/:jobId`   |
| Interviews          | `/interviews`          |
| Online Interviews   | `/online-interviews`   |
| Subscription Plans  | `/subscription-plans`  |
| Payment History     | `/payment-history`     |

### Admin Routes

| Page                  | Route                          |
| --------------------- | ------------------------------ |
| Admin Dashboard       | `/admin-dashboard`             |
| Manage Recruiters     | `/admin/recruiters`            |
| Job Categories        | `/admin/categories`            |
| Manage Plans          | `/admin/plans`                 |
| Admin Moderation      | `/admin/moderation`            |
| Audit Logs            | `/admin/audit-logs`            |
| Business Intelligence | `/admin/business-intelligence` |
| Analytics             | `/analytics`                   |

### Review Routes

| Page              | Route                    |
| ----------------- | ------------------------ |
| Company Reviews   | `/reviews/company/:id`   |
| Recruiter Reviews | `/reviews/recruiter/:id` |

---

## API Documentation

Swagger UI:

```txt
http://localhost:8000/docs
```

ReDoc:

```txt
http://localhost:8000/redoc
```

---

## Main API Modules

* Authentication
* Profiles
* Resumes
* Skills
* Education
* Experience
* Companies
* Recruiters
* Jobs
* Job Categories
* Applications
* Saved Jobs
* Shortlisting
* Interviews
* Recommendations
* AI Assistant
* Notifications
* Messages
* Plans
* Subscriptions
* Payments
* Reviews
* Reports
* Audit Logs
* Analytics
* Admin

---

## Testing Guide

### Backend Testing

Run backend:

```bash
uvicorn app.main:app --reload
```

Open Swagger:

```txt
http://localhost:8000/docs
```

Test:

1. Register user
2. Login user
3. Copy JWT token
4. Authorize in Swagger
5. Test protected APIs

---

### Frontend Testing

Run frontend:

```bash
npm run dev
```

Test these flows:

1. Register and login
2. Open dashboard
3. Update profile
4. Upload resume
5. Add skills, education, and experience
6. Search jobs
7. Apply for job
8. Track applications
9. Login as recruiter
10. Create job
11. View candidates
12. Schedule interview
13. Login as admin
14. Verify companies and recruiters
15. View analytics
16. View audit logs
17. View Business Intelligence dashboard

---

## Deployment Notes

For production deployment:

* Use environment-specific `.env` files
* Use a secure `SECRET_KEY`
* Use HTTPS
* Configure CORS properly
* Use production MySQL database
* Store uploads in cloud storage or secured server storage
* Replace mock checkout with real Stripe or Razorpay integration
* Use reverse proxy such as Nginx
* Build frontend using:

```bash
npm run build
```

---

## Screenshots

Add screenshots inside a `screenshots/` folder.

Example:

```txt
screenshots/home.png
screenshots/job-search.png
screenshots/recruiter-dashboard.png
screenshots/admin-dashboard.png
screenshots/business-intelligence.png
```

Markdown example:

```md
![Home Page](screenshots/home.png)
![Business Intelligence](screenshots/business-intelligence.png)
```

---

## Future Enhancements

* Real-time chat using WebSocket
* Stripe or Razorpay live payment integration
* Advanced AI resume scoring
* AI job matching
* Email notifications
* Calendar integration
* PDF invoice generation
* Admin export reports
* Recruiter performance scoring
* Company verification document upload
* Advanced role permissions

---

## License

This project is licensed under the MIT License.

---

## Author

**CareerConnect Pro**

Built as a full-stack job portal and recruitment management platform.
