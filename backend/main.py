from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
from models import Tank, Product, Country, AllocationRequest, AllocationResult
from data import ISO_TANKS, COMMON_PRODUCTS, COUNTRY_GVW
from logic import calculate_allocation

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iso-allocator")

app = FastAPI(title="ISO Tank Load Allocator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ISO Tank Load Allocator API is running"}

@app.get("/api/fleet", response_model=List[Tank])
async def get_fleet():
    return ISO_TANKS

@app.get("/api/products", response_model=List[Product])
async def get_products():
    return COMMON_PRODUCTS

@app.get("/api/countries", response_model=List[Country])
async def get_countries():
    return list(COUNTRY_GVW.values())

@app.post("/api/allocate", response_model=List[AllocationResult])
async def allocate(req: AllocationRequest):
    logger.info(f"Allocation request: SG={req.sg}, DG={req.isDG}, Limit={req.gwLimit}, Baffled={req.isBaffled}")
    if req.customTares:
        logger.info(f"Custom Tares: {req.customTares}")
    if req.customCaps:
        logger.info(f"Custom Capacities: {req.customCaps}")
    try:
        results = calculate_allocation(req)
        return results
    except Exception as e:
        logger.error(f"Allocation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal calculation error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
