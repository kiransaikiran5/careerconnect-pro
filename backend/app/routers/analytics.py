from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.middleware import require_role

from ..models.application import Applications, ApplicationStatus
from ..models.company import Companies
from ..models.job import Jobs
from ..models.job_category import JobCategories
from ..models.recruiter import Recruiters
from ..models.user import Users, UserRole

try:
    from ..models.payment import Payments
except Exception:
    Payments = None


router = APIRouter(prefix="/analytics", tags=["analytics"])


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def role_value(role):
    if hasattr(role, "value"):
        return role.value
    return str(role)


def is_recruiter(current_user):
    return role_value(current_user.role) == role_value(UserRole.RECRUITER)


def get_recruiter_profile_id(db: Session, current_user):
    """
    jobs.py saves:
        Jobs.recruiter_id = recruiter.id

    So recruiter analytics must filter by Recruiters.id, not Users.id.
    """
    if not is_recruiter(current_user):
        return None

    recruiter = (
        db.query(Recruiters)
        .filter(Recruiters.user_id == current_user.id)
        .first()
    )

    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter profile not found",
        )

    return recruiter.id


def apply_job_scope(query, recruiter_profile_id):
    if recruiter_profile_id is not None:
        query = query.filter(Jobs.recruiter_id == recruiter_profile_id)

    return query


def apply_application_scope(query, recruiter_profile_id):
    if recruiter_profile_id is not None:
        query = query.join(Jobs, Applications.job_id == Jobs.id).filter(
            Jobs.recruiter_id == recruiter_profile_id
        )

    return query


def safe_int(value):
    return int(value or 0)


def safe_float(value):
    return float(value or 0)


def status_text(value):
    if isinstance(value, ApplicationStatus):
        return value.value
    return str(value)


def get_payment_amount_column():
    if Payments is None:
        return None

    return getattr(Payments, "amount", None)


def get_payment_date_column():
    if Payments is None:
        return None

    payment_date_column = getattr(Payments, "payment_date", None)

    if payment_date_column is not None:
        return payment_date_column

    return getattr(Payments, "created_at", None)


def get_payment_status_column():
    if Payments is None:
        return None

    return getattr(Payments, "status", None)


def apply_completed_payment_filter(query):
    status_column = get_payment_status_column()

    if status_column is None:
        return query

    return query.filter(
        status_column.in_(
            [
                "Completed",
                "completed",
                "COMPLETED",
                "Success",
                "success",
                "SUCCESS",
                "Paid",
                "paid",
                "PAID",
            ]
        )
    )


def monthly_count_for_model(db, model, date_column):
    if date_column is None:
        return []

    month_expr = func.date_format(date_column, "%Y-%m")

    rows = (
        db.query(
            month_expr.label("month"),
            func.count(model.id).label("count"),
        )
        .group_by(month_expr)
        .order_by(month_expr)
        .all()
    )

    return [
        {
            "month": row.month,
            "count": safe_int(row.count),
        }
        for row in rows
    ]


# --------------------------------------------------------------------------
# MODULE 24: Analytics & Reports
# ADMIN      -> full platform analytics
# RECRUITER  -> own job, hiring, candidate analytics
# --------------------------------------------------------------------------

@router.get("/job-posting")
def job_posting_analytics(
    current_user=Depends(require_role(UserRole.ADMIN, UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    recruiter_profile_id = get_recruiter_profile_id(db, current_user)
    six_months_ago = datetime.now() - timedelta(days=180)

    month_expr = func.date_format(Jobs.created_at, "%Y-%m")

    monthly_query = (
        db.query(
            month_expr.label("month"),
            func.count(Jobs.id).label("count"),
        )
        .filter(Jobs.created_at >= six_months_ago)
    )

    monthly_query = apply_job_scope(monthly_query, recruiter_profile_id)

    monthly_rows = (
        monthly_query
        .group_by(month_expr)
        .order_by(month_expr)
        .all()
    )

    monthly_data = [
        {
            "month": row.month,
            "count": safe_int(row.count),
        }
        for row in monthly_rows
    ]

    category_query = (
        db.query(
            JobCategories.name.label("category"),
            func.count(Jobs.id).label("count"),
        )
        .select_from(JobCategories)
        .join(Jobs, Jobs.category_id == JobCategories.id, isouter=True)
    )

    category_query = apply_job_scope(category_query, recruiter_profile_id)

    category_rows = (
        category_query
        .group_by(JobCategories.id, JobCategories.name)
        .order_by(func.count(Jobs.id).desc())
        .all()
    )

    category_data = [
        {
            "category": row.category or "Uncategorized",
            "count": safe_int(row.count),
        }
        for row in category_rows
    ]

    company_query = (
        db.query(
            Companies.name.label("company"),
            func.count(Jobs.id).label("count"),
        )
        .select_from(Companies)
        .join(Jobs, Jobs.company_id == Companies.id)
    )

    company_query = apply_job_scope(company_query, recruiter_profile_id)

    company_rows = (
        company_query
        .group_by(Companies.id, Companies.name)
        .order_by(func.count(Jobs.id).desc())
        .limit(5)
        .all()
    )

    company_data = [
        {
            "company": row.company or "Company Not Available",
            "count": safe_int(row.count),
        }
        for row in company_rows
    ]

    return {
        "monthly": monthly_data,
        "by_category": category_data,
        "by_company": company_data,
    }


@router.get("/hiring")
def hiring_analytics(
    current_user=Depends(require_role(UserRole.ADMIN, UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    recruiter_profile_id = get_recruiter_profile_id(db, current_user)
    six_months_ago = datetime.now() - timedelta(days=180)

    month_expr = func.date_format(Applications.applied_at, "%Y-%m")

    monthly_apps_query = (
        db.query(
            month_expr.label("month"),
            func.count(Applications.id).label("count"),
        )
        .select_from(Applications)
        .filter(Applications.applied_at >= six_months_ago)
    )

    monthly_apps_query = apply_application_scope(
        monthly_apps_query,
        recruiter_profile_id,
    )

    monthly_apps_rows = (
        monthly_apps_query
        .group_by(month_expr)
        .order_by(month_expr)
        .all()
    )

    monthly_apps_data = [
        {
            "month": row.month,
            "count": safe_int(row.count),
        }
        for row in monthly_apps_rows
    ]

    def count_applications(status_filter=None):
        query = db.query(func.count(Applications.id)).select_from(Applications)

        query = apply_application_scope(query, recruiter_profile_id)

        if status_filter is not None:
            query = query.filter(Applications.status == status_filter)

        return safe_int(query.scalar())

    total_applications = count_applications()
    total_shortlisted = count_applications(ApplicationStatus.SHORTLISTED)
    total_interview = count_applications(ApplicationStatus.INTERVIEW_SCHEDULED)
    total_offered = count_applications(ApplicationStatus.OFFERED)
    total_rejected = count_applications(ApplicationStatus.REJECTED)

    funnel = [
        {"stage": "Applied", "count": total_applications},
        {"stage": "Shortlisted", "count": total_shortlisted},
        {"stage": "Interview Scheduled", "count": total_interview},
        {"stage": "Offered", "count": total_offered},
        {"stage": "Rejected", "count": total_rejected},
    ]

    avg_days = 0

    if total_offered > 0:
        avg_query = (
            db.query(
                func.avg(
                    func.datediff(Applications.applied_at, Jobs.created_at)
                )
            )
            .select_from(Applications)
            .join(Jobs, Applications.job_id == Jobs.id)
            .filter(Applications.status == ApplicationStatus.OFFERED)
        )

        if recruiter_profile_id is not None:
            avg_query = avg_query.filter(Jobs.recruiter_id == recruiter_profile_id)

        avg_result = avg_query.scalar()
        avg_days = round(float(avg_result), 1) if avg_result else 0

    return {
        "monthly_applications": monthly_apps_data,
        "funnel": funnel,
        "average_time_to_hire_days": avg_days,
    }


@router.get("/candidate")
def candidate_analytics(
    current_user=Depends(require_role(UserRole.ADMIN, UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    recruiter_profile_id = get_recruiter_profile_id(db, current_user)

    top_jobs_query = (
        db.query(
            Jobs.title.label("title"),
            func.count(Applications.id).label("applications"),
        )
        .select_from(Jobs)
        .join(Applications, Applications.job_id == Jobs.id)
    )

    top_jobs_query = apply_job_scope(top_jobs_query, recruiter_profile_id)

    top_jobs_rows = (
        top_jobs_query
        .group_by(Jobs.id, Jobs.title)
        .order_by(func.count(Applications.id).desc())
        .limit(5)
        .all()
    )

    top_jobs_data = [
        {
            "title": row.title or "Untitled Job",
            "applications": safe_int(row.applications),
        }
        for row in top_jobs_rows
    ]

    status_query = (
        db.query(
            Applications.status.label("status"),
            func.count(Applications.id).label("count"),
        )
        .select_from(Applications)
    )

    status_query = apply_application_scope(status_query, recruiter_profile_id)

    status_rows = (
        status_query
        .group_by(Applications.status)
        .order_by(func.count(Applications.id).desc())
        .all()
    )

    status_data = [
        {
            "status": status_text(row.status),
            "count": safe_int(row.count),
        }
        for row in status_rows
    ]

    return {
        "top_jobs": top_jobs_data,
        "status_distribution": status_data,
    }


# --------------------------------------------------------------------------
# MODULE 30: Business Intelligence Dashboard
# ADMIN only
# GET /analytics/business-intelligence
# --------------------------------------------------------------------------

@router.get("/business-intelligence")
def business_intelligence_dashboard(
    current_user=Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    # 1. Top Hiring Companies
    top_companies_rows = (
        db.query(
            Companies.name.label("company"),
            func.count(Jobs.id).label("job_count"),
        )
        .select_from(Companies)
        .join(Jobs, Jobs.company_id == Companies.id, isouter=True)
        .group_by(Companies.id, Companies.name)
        .order_by(func.count(Jobs.id).desc())
        .limit(5)
        .all()
    )

    top_hiring_companies = [
        {
            "company": row.company or "Company Not Available",
            "jobs": safe_int(row.job_count),
        }
        for row in top_companies_rows
    ]

    # 2. Most Applied Jobs
    most_applied_rows = (
        db.query(
            Jobs.title.label("title"),
            func.count(Applications.id).label("applications"),
        )
        .select_from(Jobs)
        .join(Applications, Applications.job_id == Jobs.id, isouter=True)
        .group_by(Jobs.id, Jobs.title)
        .order_by(func.count(Applications.id).desc())
        .limit(5)
        .all()
    )

    most_applied_jobs = [
        {
            "title": row.title or "Untitled Job",
            "applications": safe_int(row.applications),
        }
        for row in most_applied_rows
    ]

    # 3. Revenue Analytics
    total_revenue = 0.0
    monthly_revenue = []

    amount_column = get_payment_amount_column()
    payment_date_column = get_payment_date_column()

    if Payments is not None and amount_column is not None:
        revenue_query = db.query(func.sum(amount_column)).select_from(Payments)
        revenue_query = apply_completed_payment_filter(revenue_query)
        total_revenue = safe_float(revenue_query.scalar())

        if payment_date_column is not None:
            month_expr = func.date_format(payment_date_column, "%Y-%m")

            monthly_revenue_query = (
                db.query(
                    month_expr.label("month"),
                    func.sum(amount_column).label("revenue"),
                )
                .select_from(Payments)
            )

            monthly_revenue_query = apply_completed_payment_filter(monthly_revenue_query)

            monthly_revenue_rows = (
                monthly_revenue_query
                .group_by(month_expr)
                .order_by(month_expr)
                .all()
            )

            monthly_revenue = [
                {
                    "month": row.month,
                    "revenue": safe_float(row.revenue),
                }
                for row in monthly_revenue_rows
            ]

    # 4. Monthly Growth Reports
    users_date_column = getattr(Users, "created_at", None)
    jobs_date_column = getattr(Jobs, "created_at", None)
    apps_date_column = getattr(Applications, "applied_at", None)

    monthly_users = monthly_count_for_model(db, Users, users_date_column)
    monthly_jobs = monthly_count_for_model(db, Jobs, jobs_date_column)
    monthly_applications = monthly_count_for_model(db, Applications, apps_date_column)

    # 5. Platform Performance Metrics
    total_users = safe_int(db.query(func.count(Users.id)).scalar())
    total_jobs = safe_int(db.query(func.count(Jobs.id)).scalar())
    total_applications = safe_int(db.query(func.count(Applications.id)).scalar())
    total_companies = safe_int(db.query(func.count(Companies.id)).scalar())
    total_recruiters = safe_int(db.query(func.count(Recruiters.id)).scalar())

    offered_count = safe_int(
        db.query(func.count(Applications.id))
        .filter(Applications.status == ApplicationStatus.OFFERED)
        .scalar()
    )

    shortlisted_count = safe_int(
        db.query(func.count(Applications.id))
        .filter(Applications.status == ApplicationStatus.SHORTLISTED)
        .scalar()
    )

    active_jobs = 0
    is_active_column = getattr(Jobs, "is_active", None)

    if is_active_column is not None:
        active_jobs = safe_int(
            db.query(func.count(Jobs.id))
            .filter(Jobs.is_active == True)
            .scalar()
        )
    else:
        active_jobs = total_jobs

    avg_time_to_hire_result = (
        db.query(
            func.avg(
                func.datediff(Applications.applied_at, Jobs.created_at)
            )
        )
        .select_from(Applications)
        .join(Jobs, Applications.job_id == Jobs.id)
        .filter(Applications.status == ApplicationStatus.OFFERED)
        .scalar()
    )

    average_time_to_hire_days = (
        round(float(avg_time_to_hire_result), 1)
        if avg_time_to_hire_result
        else 0
    )

    conversion_rate = (
        (offered_count / total_applications * 100)
        if total_applications
        else 0.0
    )

    shortlist_rate = (
        (shortlisted_count / total_applications * 100)
        if total_applications
        else 0.0
    )

    return {
        "top_hiring_companies": top_hiring_companies,
        "most_applied_jobs": most_applied_jobs,
        "revenue_analytics": {
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
        },
        "monthly_growth_reports": {
            "users": monthly_users,
            "jobs": monthly_jobs,
            "applications": monthly_applications,
        },
        "platform_performance_metrics": {
            "total_users": total_users,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "total_companies": total_companies,
            "total_recruiters": total_recruiters,
            "offered_count": offered_count,
            "shortlisted_count": shortlisted_count,
            "average_time_to_hire_days": average_time_to_hire_days,
            "conversion_rate": round(conversion_rate, 1),
            "shortlist_rate": round(shortlist_rate, 1),
        },
    }