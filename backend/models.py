from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
import uuid
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/geosint")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TrackedAsset(Base):
    __tablename__ = "tracked_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    classification = Column(String, nullable=False) # e.g., 'Naval', 'Aerial'
    velocity = Column(Float, default=0.0)
    altitude = Column(Float, default=0.0)
    
    # Using PostGIS Geometry for optimized geospatial queries
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
