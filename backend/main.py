from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import google.generativeai as genai
import json
import re

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

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class NutritionRequestSchema(BaseModel):
    name: str
    quantity: str
    category: str

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
inventory_collection = db["inventory"]
users_collection = db["users"]

categories_collection = db["categories"]

DEFAULT_CATEGORIES = [
    {"slug": "dairy", "name": "Dairy", "icon": "water", "color": "#6BFFB8", "emoji": "🥛"},
    {"slug": "produce", "name": "Produce", "icon": "leaf", "color": "#2BFF9C", "emoji": "🥦"},
    {"slug": "meat", "name": "Meat & Fish", "icon": "restaurant", "color": "#0DED84", "emoji": "🍗"},
    {"slug": "pantry", "name": "Pantry", "icon": "file-tray-stacked", "color": "#9FF6D4", "emoji": "🥫"},
    {"slug": "frozen", "name": "Frozen", "icon": "snow", "color": "#6BFFB8", "emoji": "🧊"},
    {"slug": "beverages", "name": "Beverages", "icon": "wine", "color": "#2BFF9C", "emoji": "🧃"},
    {"slug": "bakery", "name": "Bakery", "icon": "pizza", "color": "#0BC46C", "emoji": "🍞"},
    {"slug": "spices", "name": "Spices", "icon": "flame", "color": "#0DED84", "emoji": "🌶️"},
]

def category_helper(cat) -> dict:
    return {
        "id": str(cat["_id"]),
        "slug": cat.get("slug", str(cat["_id"])),
        "name": cat["name"],
        "icon": cat.get("icon", "cube"),
        "color": cat.get("color", "#2BFF9C"),
        "emoji": cat.get("emoji", "🍽️"),
        "userEmail": cat.get("userEmail", ""),
    }

class CategorySchema(BaseModel):
    name: str
    icon: str
    color: str
    emoji: str = "🍽️"
    userEmail: str

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

# --- NEW EDIT ROUTE ---
@app.put("/api/inventory/{item_id}")
def update_item(item_id: str, item: InventoryItemSchema):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid MongoDB ID format")
    
    update_data = item.model_dump() if hasattr(item, 'model_dump') else item.dict()
    
    result = inventory_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in database")
        
    updated_item = inventory_collection.find_one({"_id": ObjectId(item_id)})
    return item_helper(updated_item)

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
        "memberSince": datetime.now().strftime("%B %Y")
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

@app.post("/api/ai/nutrition")
def get_nutrition(req: NutritionRequestSchema):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing in backend .env")
    
    try:
        model = genai.GenerativeModel("gemini-3.5-flash-lite")
        prompt = f"""
        Analyze the nutritional value of '{req.quantity}' of '{req.name}' (Category: {req.category}).
        Provide a realistic, highly accurate estimation.
        Return ONLY a valid JSON object with these exact keys. Do not include markdown blocks.
        {{
            "calories": "e.g. 250 kcal",
            "protein": "e.g. 12g",
            "carbs": "e.g. 30g",
            "fat": "e.g. 5g",
            "summary": "1 brief, fun sentence about its health benefits."
        }}
        """
        response = model.generate_content(prompt)
        
        # Safely clean the response to ensure it's pure JSON
        text = response.text.strip()
        text = re.sub(r'^```(?:json)?', '', text)
        text = re.sub(r'```$', '', text).strip()
        
        return json.loads(text)
        
    except Exception as e:
        print(f"GEMINI ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI nutrition data")

@app.get("/api/categories")
def get_categories(userEmail: str):
    user_doc = users_collection.find_one({"email": userEmail})
    
    # Seed the 8 default categories once for a user so they can edit/delete them freely
    if user_doc and not user_doc.get("categoriesSeeded", False):
        if categories_collection.count_documents({"userEmail": userEmail}) == 0:
            seed_docs = [{**cat, "userEmail": userEmail} for cat in DEFAULT_CATEGORIES]
            categories_collection.insert_many(seed_docs)
        users_collection.update_one({"email": userEmail}, {"$set": {"categoriesSeeded": True}})

    items = [category_helper(cat) for cat in categories_collection.find({"userEmail": userEmail})]
    return items

@app.post("/api/categories", status_code=201)
def create_category(category: CategorySchema):
    cat_dict = category.model_dump() if hasattr(category, "model_dump") else category.dict()
    result = categories_collection.insert_one(cat_dict)
    created = categories_collection.find_one({"_id": result.inserted_id})
    return category_helper(created)

@app.put("/api/categories/{category_id}")
def update_category(category_id: str, category: CategorySchema):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID format")

    update_data = category.model_dump() if hasattr(category, "model_dump") else category.dict()
    result = categories_collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    updated = categories_collection.find_one({"_id": ObjectId(category_id)})
    return category_helper(updated)

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: str):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID format")

    result = categories_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category deleted successfully"}