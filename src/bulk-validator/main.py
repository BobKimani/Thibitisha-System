# app/main.py
from fastapi import FastAPI
from app.validators import router as validation_router

app = FastAPI(title="Bulk Account Validator")

# Register your validation route
app.include_router(validation_router, prefix="/validate")
