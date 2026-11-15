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
recipes_collection = db["recipes"]

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

class RecipeGenerateSchema(BaseModel):
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

@app.get("/api/recipes")
def get_cached_recipes(userEmail: str):
    doc = recipes_collection.find_one({"userEmail": userEmail})
    if not doc:
        return {"recipes": [], "updatedAt": None}
    return {
        "recipes": doc.get("recipes", []),
        "updatedAt": doc.get("updatedAt"),
    }

@app.post("/api/recipes/generate")
def generate_recipes(req: RecipeGenerateSchema):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing in backend .env")

    # 1. Fetch user's current inventory and sort by earliest expiry date
    raw_items = list(inventory_collection.find({"userEmail": req.userEmail}))
    if not raw_items:
        raise HTTPException(status_code=400, detail="Your kitchen inventory is empty. Add items first!")

    now = datetime.now(timezone.utc)
    available_items = []

    for item in raw_items:
        exp_str = item.get("expiryDate", "")
        days_left = 999
        try:
            exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
            if exp_dt.tzinfo is None:
                exp_dt = exp_dt.replace(tzinfo=timezone.utc)
            days_left = (exp_dt - now).days
        except Exception:
            pass

        # Skip already expired items so Gemini doesn't suggest spoiled ingredients
        if days_left < 0:
            continue

        available_items.append({
            "name": item["name"],
            "quantity": item["quantity"],
            "daysLeft": days_left,
            "isExpiring": days_left <= 4,
        })

    if not available_items:
        raise HTTPException(
            status_code=400,
            detail="All items in your inventory are expired. Add fresh items to generate recipes."
        )

    # Sort so items expiring soonest appear first
    available_items.sort(key=lambda x: x["daysLeft"])

    inventory_lines = []
    for it in available_items:
        urgency = f" [EXPIRING SOON: {it['daysLeft']} days left - HIGH PRIORITY]" if it["isExpiring"] else f" ({it['daysLeft']} days left)"
        inventory_lines.append(f"- {it['name']} ({it['quantity']}){urgency}")

    inventory_text = "\n".join(inventory_lines)

    user_doc = users_collection.find_one({"email": req.userEmail})
    household_size = user_doc.get("householdSize", 2) if user_doc else 2

    prompt = f"""
You are a smart kitchen chef assistant for the FreshCast app.
Here is the user's current kitchen inventory, sorted by urgency:
{inventory_text}

Target household size: {household_size} people.

Generate 4 practical, delicious recipes that maximize the use of these available ingredients.
CRITICAL RULES:
1. Strongly prioritize recipes that use the [EXPIRING SOON] ingredients first.
2. For each recipe, split ingredients into two lists:
   - "inventoryIngredients": Ingredients taken from the user's inventory above, with the exact quantity needed for this recipe (do not exceed what they own). Set "isExpiring" to true if that ingredient was marked [EXPIRING SOON].
   - "extraIngredients": Necessary spices, seasonings, oils, herbs, water, or basic pantry essentials NOT listed in the user's inventory, with exact quantities (e.g., "1 tsp", "2 tbsp").
3. Return ONLY a valid JSON array of 4 recipe objects with these exact keys (no markdown fences):
[
  {{
    "title": "Recipe Name",
    "emoji": "🍲",
    "description": "1 concise, appetizing sentence about the dish.",
    "prepTime": "20 mins",
    "servings": "{household_size} servings",
    "expiringIngredientsUsed": ["Name of expiring item 1"],
    "inventoryIngredients": [
      {{ "name": "Item name", "quantity": "200 g", "isExpiring": true }}
    ],
    "extraIngredients": [
      {{ "name": "Olive Oil", "quantity": "1 tbsp" }},
      {{ "name": "Salt", "quantity": "to taste" }}
    ],
    "instructions": [
      "Step 1 clear instruction.",
      "Step 2 clear instruction."
    ]
  }}
]
"""

    try:
        model = genai.GenerativeModel("gemini-3.5-flash-lite")
        response = model.generate_content(prompt)

        text = response.text.strip()
        text = re.sub(r"^```(?:json)?", "", text)
        text = re.sub(r"```$", "", text).strip()

        recipes = json.loads(text)
        timestamp = int(now.timestamp())

        for idx, recipe in enumerate(recipes):
            recipe["id"] = f"recipe_{timestamp}_{idx}"

        updated_at = now.isoformat()
        recipes_collection.update_one(
            {"userEmail": req.userEmail},
            {"$set": {"recipes": recipes, "updatedAt": updated_at}},
            upsert=True,
        )

        return {"recipes": recipes, "updatedAt": updated_at}

    except Exception as e:
        print(f"RECIPE GEMINI ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recipes from AI")