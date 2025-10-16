import uvicorn
import os, json
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from pydantic_classes import *
from sql_alchemy import *

from fastapi.middleware.cors import CORSMiddleware

############################################
#
#   Initialize the database
#
############################################

def init_db():
    SQLALCHEMY_DATABASE_URL = "sqlite:///./Class_Diagram.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database session
SessionLocal = init_db()
# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

############################################
#
#   Measure functions
#
############################################

@app.get("/measure/", response_model=None)
def get_all_measure(database: Session = Depends(get_db)) -> list[Measure]:
    measure_list = database.query(Measure).all()
    return measure_list


@app.get("/measure/{measure_id}/", response_model=None)
async def get_measure(measure_id: int, database: Session = Depends(get_db)) -> Measure:
    db_measure = database.query(Measure).filter(Measure.id == measure_id).first()
    if db_measure is None:
        raise HTTPException(status_code=404, detail="Measure not found")

    response_data = {
        "measure": db_measure,
}
    return response_data



@app.post("/measure/", response_model=None)
async def create_measure(measure_data: MeasureCreate, database: Session = Depends(get_db)) -> Measure:


    db_measure = Measure(
        value=measure_data.value,         day=measure_data.day        )

    database.add(db_measure)
    database.commit()
    database.refresh(db_measure)


    
    return db_measure


@app.put("/measure/{measure_id}/", response_model=None)
async def update_measure(measure_id: int, measure_data: MeasureCreate, database: Session = Depends(get_db)) -> Measure:
    db_measure = database.query(Measure).filter(Measure.id == measure_id).first()
    if db_measure is None:
        raise HTTPException(status_code=404, detail="Measure not found")

    setattr(db_measure, 'value', measure_data.value)
    setattr(db_measure, 'day', measure_data.day)
    database.commit()
    database.refresh(db_measure)
    return db_measure


@app.delete("/measure/{measure_id}/", response_model=None)
async def delete_measure(measure_id: int, database: Session = Depends(get_db)):
    db_measure = database.query(Measure).filter(Measure.id == measure_id).first()
    if db_measure is None:
        raise HTTPException(status_code=404, detail="Measure not found")
    database.delete(db_measure)
    database.commit()
    return db_measure





############################################
# Maintaining the server
############################################
if __name__ == "__main__":
    import uvicorn
    openapi_schema = app.openapi()
    output_dir = os.path.join(os.getcwd(), 'output_backend')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'openapi_specs.json')
    print(f"Writing OpenAPI schema to {output_file}")
    print("Swagger UI available at 0.0.0.0:8000/docs")
    with open(output_file, 'w') as file:
        json.dump(openapi_schema, file)
    uvicorn.run(app, host="0.0.0.0", port= 8000)



