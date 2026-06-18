# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings          # project settings (upload_dir comes from here)
from .core.database import engine, Base
# Import all models so they are known to Base.metadata
from .models import (
    Users, UserRole,
    Profiles,
    Resumes, 
    Skills,
    Education,
    Experience,
    Companies,
    Recruiters,
    Jobs,
    JobCategories,
    Applications,
    ApplicationStatus,
    SavedJobs,
    Interviews,
    Notifications,
    Messages,
    Plans, 
    Subscriptions,
    Payments,
    Reviews,
    AuditLogs,
    ReportedContent
    
    # add other models as you create them:
    # Resumes, Skills, Education, Experience,
    # Companies, Recruiters, Jobs, JobCategories,
    # Applications, ApplicationStatus,
    # Interviews, Notifications, Messages,
    # SavedJobs, Plans, Subscriptions,
    # Payments, Reviews, AuditLogs,
)

from .routers import auth, profiles, resumes, skills, education, experience, companies, recruiters, jobs, job_categories, search, applications, saved_jobs, shortlisting, interviews, recommendations, ai_assistant, notifications, messages, admin, analytics, plans, subscriptions, payments, reviews, audit, reports
# add other routers later

# Create all database tables (in production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerConnect Pro API")

# CORS – allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount static files
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(resumes.router)
app.include_router(skills.router)
app.include_router(education.router)
app.include_router(experience.router)
app.include_router(companies.router)
app.include_router(recruiters.router)
app.include_router(jobs.router)
app.include_router(job_categories.router)
app.include_router(search.router)
app.include_router(applications.router)
app.include_router(saved_jobs.router)
app.include_router(shortlisting.router)
app.include_router(interviews.router)
app.include_router(recommendations.router)
app.include_router(ai_assistant.router)
app.include_router(notifications.router)
app.include_router(messages.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(plans.router)
app.include_router(subscriptions.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(audit.router)
app.include_router(reports.router)

# add other routers later




@app.get("/")
def root():
    return {"message": "CareerConnect Pro API is running"}