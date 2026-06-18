from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Skills(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(100))               # e.g., Programming, Soft Skills
    proficiency_level = Column(String(50))        # e.g., Beginner, Intermediate, Advanced

    user = relationship("Users", backref="skills")