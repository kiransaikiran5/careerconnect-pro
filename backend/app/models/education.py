from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255))                # e.g., Bachelor of Science
    field_of_study = Column(String(255))        # e.g., Computer Science
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    grade = Column(String(50))                  # e.g., GPA, percentage
    is_certification = Column(Boolean, default=False)   # <-- marks as certification

    user = relationship("Users", backref="education")