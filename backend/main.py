from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import engine, Base
import models
from routes import users, assets, complaints, community, rooms, mess

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hostel Management System API",
              description="API for an AI-enhanced hostel management system",
              version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",  # If running locally
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all the routers
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(assets.router, prefix="/api", tags=["Assets"])
app.include_router(complaints.router, prefix="/api", tags=["Complaints"])
app.include_router(community.router, prefix="/api", tags=["Community"])
app.include_router(rooms.router, prefix="/api", tags=["Rooms"])
app.include_router(mess.router, prefix="/api", tags=["Mess"])


@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint."""
    return {"message": "Welcome to the Hostel Management System API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
