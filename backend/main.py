from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

app = FastAPI(title="FreshCast Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "freshcast")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
inventory_collection = db["inventory"]
users_collection = db["users"]

def item_helper(item) -> dict:
    return {
        "id": str(item["_id"]),
        "name": item["name"],
        "categoryId": item["categoryId"],
        "emoji": item.get("emoji", "🍽️"),
        "quantity": item["quantity"],
        "expiryDate": item["expiryDate"],
        "addedDate": item.get("addedDate", datetime.now(timezone.utc).isoformat()),
        "userEmail": item.get("userEmail", "")
    }

# 1. Add userEmail to the Schema
class InventoryItemSchema(BaseModel):
    name: str
    categoryId: str
    emoji: str
    quantity: str
    expiryDate: str
    userEmail: str

class UserSignupSchema(BaseModel):
    name: str
    email: str
    password: str

class UserLoginSchema(BaseModel):
    email: str
    password: str

@app.get("/")
def read_root():
    return {"message": "FreshCast Python Backend is running!"}

# 2. Update GET to filter by userEmail
@app.get("/api/inventory")
def get_inventory(userEmail: str):
    items = []
    # Only find items belonging to this specific email
    for item in inventory_collection.find({"userEmail": userEmail}):
        items.append(item_helper(item))
    return items

# 3. Update POST to save the userEmail along with the item
@app.post("/api/inventory", status_code=201)
def add_item(item: InventoryItemSchema):
    try:
        item_dict = item.model_dump() if hasattr(item, 'model_dump') else item.dict()
        item_dict["addedDate"] = datetime.now(timezone.utc).isoformat()
        
        result = inventory_collection.insert_one(item_dict)
        created_item = inventory_collection.find_one({"_id": result.inserted_id})
        return item_helper(created_item)
        
    except Exception as e:
        print(f"BACKEND ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inventory/{item_id}")
def delete_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid MongoDB ID format")
    
    result = inventory_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in database")
    
    return {"message": "Item deleted successfully"}

@app.post("/api/auth/signup")
def signup(user: UserSignupSchema):
    # Check if the email is already in the database
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create a new user dictionary
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": user.password, # Note: In a real app, you would hash this password!
        "householdSize": 1, # Default size for a new user
        "memberSince": datetime.now().strftime("%B %Y") # Formats as "October 2026"
    }
    
    users_collection.insert_one(new_user)
    new_user["id"] = str(new_user["_id"])
    del new_user["_id"]
    del new_user["password"] # Never send the password back to the frontend
    
    return new_user

# 4. Create the Login Route
@app.post("/api/auth/login")
def login(user: UserLoginSchema):
    # Find the user by email and password
    existing_user = users_collection.find_one({"email": user.email, "password": user.password})
    
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    existing_user["id"] = str(existing_user["_id"])
    del existing_user["_id"]
    del existing_user["password"]
    
    return existing_user