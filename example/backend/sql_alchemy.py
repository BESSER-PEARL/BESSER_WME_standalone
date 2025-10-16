import enum
from typing import List, Optional
from sqlalchemy import (
    create_engine, Column, ForeignKey, Table, Text, Boolean, String, Date, 
    Time, DateTime, Float, Integer, Enum
)
from sqlalchemy.orm import (
    column_property, DeclarativeBase, Mapped, mapped_column, relationship
)
from datetime import datetime, time, date

class Base(DeclarativeBase):
    pass



# Tables definition for many-to-many relationships

# Tables definition
class Measure(Base):
    __tablename__ = "measure"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int] = mapped_column(Integer)
    day: Mapped[date] = mapped_column(Date)


# Database connection

DATABASE_URL = "sqlite:///Class_Diagram.db"  # SQLite connection

engine = create_engine(DATABASE_URL, echo=True)

# Create tables in the database
Base.metadata.create_all(engine, checkfirst=True)