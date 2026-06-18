# backend/app/routers/ai_assistant.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

from ..core.security import get_current_user
from ..models.user import UserRole

router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])


class AIQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)


class AIResponse(BaseModel):
    response: str
    category: str
    suggestions: List[str] = []


def normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())


def has_any(text: str, keywords: List[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def get_user_role(current_user) -> str:
    role = getattr(current_user, "role", "")

    if isinstance(role, UserRole):
        return role.value

    return str(role).upper()


@router.post("/ask", response_model=AIResponse)
def ask_assistant(
    payload: AIQuery,
    current_user=Depends(get_current_user),
):
    q = normalize_text(payload.query)

    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty",
        )

    user_role = get_user_role(current_user)

    # ----------------------------------------------------------------------
    # Greeting / Help
    # ----------------------------------------------------------------------
    if has_any(q, ["hello", "hi", "hey", "help", "start"]):
        return AIResponse(
            category="help",
            response=(
                "Hello! I am your AI Career Assistant. You can ask me about "
                "resume tips, interview preparation, career growth, skills, "
                "job search, applications, and hiring guidance."
            ),
            suggestions=[
                "How can I improve my resume?",
                "How should I prepare for an interview?",
                "Which skills should I learn for a software job?",
                "How can I get more job matches?",
            ],
        )

    # ----------------------------------------------------------------------
    # Resume / CV suggestions
    # ----------------------------------------------------------------------
    if has_any(q, ["resume", "cv", "curriculum vitae"]):
        if has_any(q, ["format", "layout", "template", "design"]):
            response = (
                "Use a clean one-page or two-page resume layout with clear sections: "
                "Summary, Skills, Projects, Experience, Education, and Certifications. "
                "Use a simple font, consistent spacing, and export it as PDF."
            )
        elif has_any(q, ["summary", "objective", "profile"]):
            response = (
                "Write a 2 to 3 sentence professional summary. Mention your role target, "
                "top skills, project experience, and the value you can bring. Avoid generic lines."
            )
        elif has_any(q, ["fresher", "student", "entry level"]):
            response = (
                "As a fresher, highlight projects, internships, technical skills, certifications, "
                "academic achievements, and GitHub or portfolio links. Keep it practical and role-focused."
            )
        elif has_any(q, ["ats", "keywords"]):
            response = (
                "For ATS-friendly resumes, use job description keywords naturally. Avoid tables, images, "
                "heavy graphics, and unusual fonts. Use simple headings like Skills, Experience, and Education."
            )
        else:
            response = (
                "Tailor your resume for each job. Use action verbs such as developed, improved, designed, "
                "managed, and optimized. Add measurable results wherever possible."
            )

        return AIResponse(
            category="resume",
            response=response,
            suggestions=[
                "How to write resume summary?",
                "Give me ATS resume tips",
                "Resume tips for fresher",
                "How to improve my project section?",
            ],
        )

    # ----------------------------------------------------------------------
    # Career guidance
    # ----------------------------------------------------------------------
    if has_any(q, ["career", "path", "growth", "promotion", "switch", "change career"]):
        if has_any(q, ["switch", "change"]):
            response = (
                "To switch careers, first identify transferable skills, then learn the missing skills "
                "for your target role. Build 2 to 3 projects, update your resume, and start applying "
                "to entry-level or transition-friendly roles."
            )
        elif has_any(q, ["promotion", "raise", "salary hike"]):
            response = (
                "For promotion, document your achievements, show business impact, take ownership of "
                "important tasks, and ask your manager for clear growth expectations."
            )
        elif has_any(q, ["fresher", "first job"]):
            response = (
                "As a fresher, focus on one target role, build strong fundamentals, create projects, "
                "prepare interview answers, and apply consistently. Quality applications matter more than bulk clicking."
            )
        else:
            response = (
                "Set a clear career goal for the next 6 to 12 months. Improve your skills, update your resume, "
                "build proof of work, and track your applications regularly."
            )

        return AIResponse(
            category="career_guidance",
            response=response,
            suggestions=[
                "How to choose my career path?",
                "How to switch to software development?",
                "How to grow in my current role?",
                "How to get my first job?",
            ],
        )

    # ----------------------------------------------------------------------
    # Skill recommendations
    # ----------------------------------------------------------------------
    if has_any(q, ["skill", "skills", "learn", "upskill", "course", "technology"]):
        if has_any(q, ["frontend", "react", "javascript", "ui"]):
            response = (
                "For frontend roles, focus on HTML, CSS, JavaScript, React, routing, API integration, "
                "forms, authentication, responsive UI, Git, and basic testing."
            )
        elif has_any(q, ["backend", "fastapi", "python", "api"]):
            response = (
                "For backend roles, learn Python, FastAPI, SQLAlchemy, databases, authentication, REST APIs, "
                "validation, error handling, and deployment basics."
            )
        elif has_any(q, ["devops", "cloud", "aws", "docker", "kubernetes"]):
            response = (
                "For DevOps, focus on Linux, Git, Docker, CI/CD, AWS basics, Terraform, monitoring, "
                "and deployment pipelines."
            )
        elif has_any(q, ["data", "ai", "machine learning", "ml"]):
            response = (
                "For AI and data roles, learn Python, Pandas, NumPy, SQL, statistics, machine learning basics, "
                "model evaluation, and data visualization."
            )
        elif has_any(q, ["soft", "communication", "leadership"]):
            response = (
                "Improve communication, teamwork, problem solving, time management, and confidence. "
                "Practice explaining your projects clearly in simple language."
            )
        else:
            response = (
                "Choose skills based on your target job. Add your strongest skills in CareerConnect Pro "
                "so the recommendation system can suggest better jobs."
            )

        return AIResponse(
            category="skills",
            response=response,
            suggestions=[
                "Skills for frontend developer",
                "Skills for backend developer",
                "Skills for DevOps engineer",
                "Soft skills for interviews",
            ],
        )

    # ----------------------------------------------------------------------
    # Interview preparation
    # ----------------------------------------------------------------------
    if has_any(q, ["interview", "prepare", "question", "answer", "hr round", "technical round"]):
        if has_any(q, ["technical", "coding", "programming"]):
            response = (
                "For technical interviews, revise fundamentals, practice coding problems, understand your projects, "
                "and explain your thought process clearly. Do not just give final answers."
            )
        elif has_any(q, ["behavioral", "star", "situation", "task", "action", "result"]):
            response = (
                "Use the STAR method: Situation, Task, Action, Result. Prepare examples for teamwork, conflict, "
                "leadership, failure, learning, and problem solving."
            )
        elif has_any(q, ["hr", "self introduction", "tell me about yourself"]):
            response = (
                "Prepare a simple self-introduction covering your education, skills, projects, career goal, "
                "and why you are interested in the role."
            )
        else:
            response = (
                "Research the company, revise the job description, prepare common questions, keep your resume ready, "
                "test your camera and microphone for online interviews, and join 10 minutes early."
            )

        return AIResponse(
            category="interview",
            response=response,
            suggestions=[
                "How to answer tell me about yourself?",
                "Technical interview preparation tips",
                "Behavioral interview STAR method",
                "HR interview common questions",
            ],
        )

    # ----------------------------------------------------------------------
    # Job search / applications
    # ----------------------------------------------------------------------
    if has_any(q, ["job", "apply", "application", "recommended jobs", "search job", "find job"]):
        if user_role == "JOB_SEEKER":
            response = (
                "Apply to jobs that match your skills and experience. Keep your profile, resume, skills, "
                "education, and experience updated. Use recommendations and saved jobs to track good opportunities."
            )
        elif user_role == "RECRUITER":
            response = (
                "To attract better applicants, write clear job descriptions, mention required skills, salary range, "
                "location, job type, and screening expectations."
            )
        elif user_role == "ADMIN":
            response = (
                "As an admin, monitor job quality, recruiter activity, categories, and platform usage to keep "
                "the hiring flow clean and reliable."
            )
        else:
            response = (
                "Use filters, recommendations, and profile updates to improve job matching."
            )

        return AIResponse(
            category="job_search",
            response=response,
            suggestions=[
                "How to get better job recommendations?",
                "How to write a good job application?",
                "How to improve my profile?",
                "How to save jobs?",
            ],
        )

    # ----------------------------------------------------------------------
    # Recruiter help
    # ----------------------------------------------------------------------
    if has_any(q, ["recruiter", "candidate", "shortlist", "reject", "hiring"]):
        response = (
            "Review candidate resumes, cover letters, and skills carefully. Shortlist candidates who match the role, "
            "schedule interviews, add feedback after interviews, and keep statuses updated."
        )

        return AIResponse(
            category="recruiter_help",
            response=response,
            suggestions=[
                "How to shortlist candidates?",
                "How to schedule interviews?",
                "How to write interview feedback?",
                "How to improve job postings?",
            ],
        )

    # ----------------------------------------------------------------------
    # Fallback
    # ----------------------------------------------------------------------
    return AIResponse(
        category="general",
        response=(
            "I can help with career guidance, resume tips, interview preparation, skill suggestions, "
            "job search, applications, and recruiter workflows. Try asking a more specific question."
        ),
        suggestions=[
            "Give me resume tips",
            "How to prepare for interview?",
            "Which skills should I learn?",
            "How to get job recommendations?",
        ],
    )