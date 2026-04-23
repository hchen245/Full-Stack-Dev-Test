from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="HVAC Estimate API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the data directory path
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


# Pydantic models
class Customer(BaseModel):
    id: str
    name: str
    address: str
    phone: Optional[str] = None


class Equipment(BaseModel):
    id: str
    name: str
    category: str
    brand: str
    modelNumber: str
    baseCost: float


class LaborRateHours(BaseModel):
    min: int
    max: int


class LaborRate(BaseModel):
    jobType: str
    level: str
    hourlyRate: float
    estimatedHours: LaborRateHours


class SelectedEquipment(BaseModel):
    id: str
    name: str
    cost: float


class JobDetails(BaseModel):
    type: str
    complexity: str
    hours: float
    notes: str


class CustomerInfo(BaseModel):
    id: str
    name: str
    address: str
    phone: Optional[str] = None


class EstimateRequest(BaseModel):
    customerId: str
    jobType: str
    complexity: str
    equipmentIds: List[str] = []
    estimatedHours: Optional[float] = None
    notes: str = ""


class EstimateResponse(BaseModel):
    id: str
    createdAt: str
    customer: CustomerInfo
    jobDetails: JobDetails
    equipment: List[SelectedEquipment]
    laborCost: float
    equipmentCost: float
    subtotal: float
    tax: float
    total: float


# Load data functions
def load_json(filename: str):
    """Load JSON data from the data directory"""
    file_path = DATA_DIR / filename
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Cache loaded data
customers_data = load_json("customers.json")
equipment_data = load_json("equipment.json")
labor_rates_data = load_json("labor_rates.json")


# API Routes
@app.get("/api/customers")
async def get_customers():
    """Get all customers"""
    return customers_data


@app.get("/api/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get a specific customer by ID"""
    customer = next((c for c in customers_data if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@app.get("/api/equipment")
async def get_equipment():
    """Get all equipment"""
    return equipment_data


@app.get("/api/labor-rates")
async def get_labor_rates():
    """Get all labor rates"""
    return labor_rates_data


@app.post("/api/estimate", response_model=EstimateResponse)
async def create_estimate(request: EstimateRequest):
    """Create a new estimate"""
    try:
        # Find customer
        customer = next(
            (c for c in customers_data if c["id"] == request.customerId), None
        )
        if not customer:
            raise HTTPException(status_code=400, detail="Customer not found")

        # Find labor rate
        labor_rate = next(
            (
                lr
                for lr in labor_rates_data
                if lr["jobType"] == request.jobType and lr["level"] == request.complexity
            ),
            None,
        )
        if not labor_rate:
            raise HTTPException(
                status_code=400, detail="Invalid job type or complexity"
            )

        # Calculate labor cost
        hours = (
            request.estimatedHours
            if request.estimatedHours
            else labor_rate["estimatedHours"]["min"]
        )
        labor_cost = hours * labor_rate["hourlyRate"]

        # Calculate equipment cost
        equipment_cost = 0
        selected_equipment = []
        for eq_id in request.equipmentIds:
            eq = next((e for e in equipment_data if e["id"] == eq_id), None)
            if eq:
                equipment_cost += eq["baseCost"]
                selected_equipment.append(
                    {"id": eq["id"], "name": eq["name"], "cost": eq["baseCost"]}
                )

        # Calculate totals
        subtotal = labor_cost + equipment_cost
        tax_rate = 0.08  # 8% tax
        tax = subtotal * tax_rate
        total = subtotal + tax

        # Create estimate response
        estimate = EstimateResponse(
            id=f"EST-{int(datetime.now().timestamp() * 1000)}",
            createdAt=datetime.now().isoformat(),
            customer=CustomerInfo(
                id=customer["id"],
                name=customer["name"],
                address=customer["address"],
                phone=customer.get("phone"),  # Safe access to optional phone field
            ),
            jobDetails=JobDetails(
                type=request.jobType,
                complexity=request.complexity,
                hours=hours,
                notes=request.notes,
            ),
            equipment=selected_equipment,
            laborCost=labor_cost,
            equipmentCost=equipment_cost,
            subtotal=subtotal,
            tax=tax,
            total=total,
        )

        return estimate

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HVAC Estimate API",
        "version": "1.0.0",
        "endpoints": {
            "customers": "/api/customers",
            "equipment": "/api/equipment",
            "labor_rates": "/api/labor-rates",
            "estimate": "/api/estimate (POST)",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
