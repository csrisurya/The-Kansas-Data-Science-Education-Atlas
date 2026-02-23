from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(255), nullable=False, index=True)
    degree_name = Column(String(255))
    dept_name = Column(String(255))
    course_code = Column(String(255))
    course_name = Column(String(255))
    description = Column(Text)
    level = Column(String(50))
    modality = Column(String(50))
    course_url = Column(Text)

    def __repr__(self):
        return f"<Course(id={self.id}, school_name='{self.school_name}', course_name='{self.course_name}')>"
