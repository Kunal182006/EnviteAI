from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client (use test keys if not provided)
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'placeholder_secret')
razorpay_client = None
try:
    if RAZORPAY_KEY_ID != 'rzp_test_placeholder':
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    logging.warning(f"Razorpay not configured: {e}")

# Create the main app
app = FastAPI(title="InviteAI API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    is_founding_member: bool = False
    tier: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wedding(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bride_name: str
    groom_name: str
    wedding_date: str
    religion: str = "Hindu"
    style: str = "Traditional"
    colors: Optional[str] = None
    venue: Optional[str] = None
    parents_names: Optional[str] = None
    couple_photo_url: Optional[str] = None
    status: str = "creating"
    conversation_history: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WeddingCreate(BaseModel):
    bride_name: str
    groom_name: str
    wedding_date: str
    religion: str = "Hindu"
    style: str = "Traditional"
    colors: Optional[str] = None
    venue: Optional[str] = None
    parents_names: Optional[str] = None
    couple_photo_url: Optional[str] = None

class WeddingUpdate(BaseModel):
    bride_name: Optional[str] = None
    groom_name: Optional[str] = None
    wedding_date: Optional[str] = None
    religion: Optional[str] = None
    style: Optional[str] = None
    colors: Optional[str] = None
    venue: Optional[str] = None
    parents_names: Optional[str] = None
    couple_photo_url: Optional[str] = None
    status: Optional[str] = None

class Design(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    card_type: str
    variation_number: int
    preview_url: str
    high_res_url: Optional[str] = None
    whatsapp_url: Optional[str] = None
    is_selected: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    wedding_id: str
    tier: str
    amount: int
    currency: str = "INR"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class ChatMessage(BaseModel):
    message: str
    wedding_id: Optional[str] = None

class PaymentCreate(BaseModel):
    tier: str
    wedding_id: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    wedding_id: str

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user info"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token (Emergent OAuth)"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            auth_response.raise_for_status()
            auth_data = auth_response.json()
        except Exception as e:
            logging.error(f"Auth error: {e}")
            raise HTTPException(status_code=401, detail="Invalid session")
    
    email = auth_data.get("email")
    name = auth_data.get("name", "")
    picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token")
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Check founding member count
        founding_count = await db.users.count_documents({"is_founding_member": True})
        is_founding = founding_count < 100
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "is_founding_member": is_founding,
            "tier": "premium" if is_founding else "free",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc).model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== WEDDING ENDPOINTS ====================

@api_router.post("/weddings", response_model=dict)
async def create_wedding(wedding_data: WeddingCreate, request: Request):
    """Create a new wedding"""
    user = await require_auth(request)
    
    wedding = Wedding(
        user_id=user.user_id,
        **wedding_data.model_dump()
    )
    
    doc = wedding.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.weddings.insert_one(doc)
    
    return {"id": wedding.id, "message": "Wedding created"}

@api_router.get("/weddings", response_model=List[dict])
async def get_weddings(request: Request):
    """Get all weddings for current user"""
    user = await require_auth(request)
    
    weddings = await db.weddings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return weddings

@api_router.get("/weddings/{wedding_id}")
async def get_wedding(wedding_id: str, request: Request):
    """Get a specific wedding"""
    user = await require_auth(request)
    
    wedding = await db.weddings.find_one(
        {"id": wedding_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    return wedding

@api_router.patch("/weddings/{wedding_id}")
async def update_wedding(wedding_id: str, updates: WeddingUpdate, request: Request):
    """Update a wedding"""
    user = await require_auth(request)
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    result = await db.weddings.update_one(
        {"id": wedding_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    return {"message": "Wedding updated"}

@api_router.delete("/weddings/{wedding_id}")
async def delete_wedding(wedding_id: str, request: Request):
    """Delete a wedding"""
    user = await require_auth(request)
    
    result = await db.weddings.delete_one(
        {"id": wedding_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    # Also delete related designs
    await db.designs.delete_many({"wedding_id": wedding_id})
    
    return {"message": "Wedding deleted"}

# ==================== CHAT ENDPOINT (MOCK) ====================

# Mock AI responses for demo
MOCK_RESPONSES = {
    "greeting": """नमस्ते! 🙏
Hi! I'm your AI wedding card designer.

Tell me about your wedding in English, Hindi, or Hinglish - whatever feels comfortable!

You can write everything at once like:
"मेरी शादी June में है। नाम Priya और Rahul। Hindu wedding है। Traditional style चाहिए red and gold में।"

या step by step भी बता सकते हैं।

What are your wedding details? 😊""",
    
    "ask_names": """That sounds wonderful! 🎉

Let me help you create beautiful invitation cards. 

Could you tell me:
1. Bride's name (दुल्हन का नाम)?
2. Groom's name (दूल्हे का नाम)?

Feel free to share in Hindi or English! 💑""",
    
    "ask_date": """Beautiful names! 💕

Now, when is the big day?
- Wedding date (शादी की तारीख)?
- Venue/City (शादी कहाँ होगी)?

ये details से मैं perfect card design कर पाऊंगा! 📅""",
    
    "ask_style": """Perfect! The date is set! 🗓️

One more thing - what style would you prefer?

1. **Traditional** - Rich, ornate, heavy gold with classic patterns
2. **Modern** - Contemporary with subtle traditional elements  
3. **Fusion** - Best of both worlds

And your preferred colors? (Red & Gold are classic for Hindu weddings!) 🎨""",
    
    "ready": """मुझे सब मिल गया! I have everything I need! ✨

Let me create beautiful designs for your wedding!

Creating 4 stunning invitation cards:
- 📱 Save the Date
- 🌸 Mehendi/Sangeet  
- 💍 Wedding Card (Main)
- 🎊 Reception

This will take just a moment... ✨

[READY_TO_GENERATE]"""
}

def get_mock_response(message: str, conversation_len: int) -> dict:
    """Generate mock AI response based on message content and conversation length"""
    message_lower = message.lower()
    
    # Check for keywords to determine response
    has_names = any(word in message_lower for word in ['priya', 'rahul', 'and', 'aur', 'bride', 'groom', '&'])
    has_date = any(word in message_lower for word in ['june', 'july', 'august', 'january', 'february', 'march', 'april', 'may', 'september', 'october', 'november', 'december', '2025', '2026', 'date'])
    has_religion = any(word in message_lower for word in ['hindu', 'muslim', 'sikh', 'christian'])
    has_style = any(word in message_lower for word in ['traditional', 'modern', 'fusion', 'classic'])
    
    # Extract data from message
    extracted_data = {}
    
    if 'priya' in message_lower:
        extracted_data['brideName'] = 'Priya'
    if 'rahul' in message_lower:
        extracted_data['groomName'] = 'Rahul'
    if 'june' in message_lower:
        extracted_data['date'] = 'June 15, 2026'
    if has_religion:
        for r in ['Hindu', 'Muslim', 'Sikh', 'Christian']:
            if r.lower() in message_lower:
                extracted_data['religion'] = r
                break
    if has_style:
        for s in ['Traditional', 'Modern', 'Fusion']:
            if s.lower() in message_lower:
                extracted_data['style'] = s
                break
    
    # Determine which response to give
    if conversation_len == 0:
        return {"message": MOCK_RESPONSES["greeting"], "extractedData": {}, "readyToGenerate": False}
    
    # If message contains lots of info, skip to ready
    info_count = sum([has_names, has_date, has_religion, has_style])
    
    if info_count >= 3:
        return {"message": MOCK_RESPONSES["ready"], "extractedData": extracted_data, "readyToGenerate": True}
    
    if conversation_len == 1:
        if has_names:
            return {"message": MOCK_RESPONSES["ask_date"], "extractedData": extracted_data, "readyToGenerate": False}
        return {"message": MOCK_RESPONSES["ask_names"], "extractedData": extracted_data, "readyToGenerate": False}
    
    if conversation_len == 2:
        if has_date:
            return {"message": MOCK_RESPONSES["ask_style"], "extractedData": extracted_data, "readyToGenerate": False}
        return {"message": MOCK_RESPONSES["ask_date"], "extractedData": extracted_data, "readyToGenerate": False}
    
    if conversation_len >= 3:
        return {"message": MOCK_RESPONSES["ready"], "extractedData": extracted_data, "readyToGenerate": True}
    
    return {"message": MOCK_RESPONSES["greeting"], "extractedData": {}, "readyToGenerate": False}

@api_router.post("/chat")
async def chat(chat_message: ChatMessage, request: Request):
    """Chat with AI (MOCK for now)"""
    user = await require_auth(request)
    
    wedding = None
    conversation_len = 0
    
    if chat_message.wedding_id:
        wedding = await db.weddings.find_one(
            {"id": chat_message.wedding_id, "user_id": user.user_id},
            {"_id": 0}
        )
        if wedding:
            conversation_len = len(wedding.get("conversation_history", []))
    
    # Get mock response
    response = get_mock_response(chat_message.message, conversation_len)
    
    # Save conversation
    if chat_message.wedding_id and wedding:
        new_history = wedding.get("conversation_history", [])
        new_history.append({"role": "user", "content": chat_message.message})
        new_history.append({"role": "assistant", "content": response["message"]})
        
        await db.weddings.update_one(
            {"id": chat_message.wedding_id},
            {"$set": {"conversation_history": new_history}}
        )
    
    return response

# ==================== DESIGN GENERATION (MOCK) ====================

# Mock design images (placeholder Indian wedding card images)
MOCK_DESIGNS = {
    "saveTheDate": [
        "https://images.unsplash.com/photo-1722952934708-749c22eb2e58?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1665960213508-48f07086d49c?w=800&h=1200&fit=crop",
    ],
    "mehendi": [
        "https://plus.unsplash.com/premium_photo-1682092632793-c7d75b23718e?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1601121141461-0ac0e6a47e53?w=800&h=1200&fit=crop",
    ],
    "wedding": [
        "https://plus.unsplash.com/premium_photo-1754759085353-d4ef2feb53c5?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=1200&fit=crop",
    ],
    "reception": [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=1200&fit=crop",
    ]
}

@api_router.post("/generate-designs/{wedding_id}")
async def generate_designs(wedding_id: str, request: Request):
    """Generate designs for a wedding (MOCK)"""
    user = await require_auth(request)
    
    wedding = await db.weddings.find_one(
        {"id": wedding_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    # Check user tier for variations
    tier = user.tier
    variations_per_card = 2 if tier == "free" else (4 if tier == "earlybird" else 6)
    
    all_designs = []
    card_types = ["saveTheDate", "mehendi", "wedding", "reception"]
    
    for card_type in card_types:
        mock_urls = MOCK_DESIGNS.get(card_type, MOCK_DESIGNS["wedding"])
        
        for i in range(min(variations_per_card, len(mock_urls))):
            design_id = str(uuid.uuid4())
            design_doc = {
                "id": design_id,
                "wedding_id": wedding_id,
                "card_type": card_type,
                "variation_number": i + 1,
                "preview_url": mock_urls[i % len(mock_urls)],
                "high_res_url": mock_urls[i % len(mock_urls)],
                "whatsapp_url": mock_urls[i % len(mock_urls)],
                "is_selected": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.designs.insert_one(design_doc)
            all_designs.append(design_doc)
    
    # Update wedding status
    await db.weddings.update_one(
        {"id": wedding_id},
        {"$set": {"status": "designs_ready"}}
    )
    
    return {
        "success": True,
        "designs": all_designs,
        "message": f"Generated {len(all_designs)} designs! (MOCK - Real AI coming soon)"
    }

@api_router.get("/designs/{wedding_id}")
async def get_designs(wedding_id: str, request: Request):
    """Get all designs for a wedding"""
    user = await require_auth(request)
    
    # Verify wedding belongs to user
    wedding = await db.weddings.find_one(
        {"id": wedding_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    designs = await db.designs.find(
        {"wedding_id": wedding_id},
        {"_id": 0}
    ).to_list(100)
    
    return designs

@api_router.patch("/designs/{design_id}/select")
async def select_design(design_id: str, request: Request):
    """Select a design"""
    user = await require_auth(request)
    
    design = await db.designs.find_one({"id": design_id}, {"_id": 0})
    
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verify wedding belongs to user
    wedding = await db.weddings.find_one(
        {"id": design["wedding_id"], "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    # Deselect other designs of same card type
    await db.designs.update_many(
        {"wedding_id": design["wedding_id"], "card_type": design["card_type"]},
        {"$set": {"is_selected": False}}
    )
    
    # Select this design
    await db.designs.update_one(
        {"id": design_id},
        {"$set": {"is_selected": True}}
    )
    
    return {"message": "Design selected"}

# ==================== PAYMENT ENDPOINTS ====================

TIER_PRICES = {
    "earlybird": 29900,  # ₹299 in paise
    "premium": 59900      # ₹599 in paise
}

@api_router.post("/payment/create-order")
async def create_payment_order(payment: PaymentCreate, request: Request):
    """Create Razorpay order"""
    user = await require_auth(request)
    
    if payment.tier not in TIER_PRICES:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    amount = TIER_PRICES[payment.tier]
    
    # For demo, return mock order if Razorpay not configured
    if not razorpay_client:
        mock_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        
        # Save order
        order_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user.user_id,
            "wedding_id": payment.wedding_id,
            "tier": payment.tier,
            "amount": amount,
            "currency": "INR",
            "razorpay_order_id": mock_order_id,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.orders.insert_one(order_doc)
        
        return {
            "orderId": mock_order_id,
            "amount": amount,
            "currency": "INR",
            "key": "rzp_test_mock",
            "mock": True
        }
    
    # Create real Razorpay order
    try:
        razor_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "wedding_id": payment.wedding_id,
                "tier": payment.tier,
                "user_id": user.user_id
            }
        })
        
        # Save order
        order_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user.user_id,
            "wedding_id": payment.wedding_id,
            "tier": payment.tier,
            "amount": amount,
            "currency": "INR",
            "razorpay_order_id": razor_order["id"],
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.orders.insert_one(order_doc)
        
        return {
            "orderId": razor_order["id"],
            "amount": amount,
            "currency": "INR",
            "key": RAZORPAY_KEY_ID
        }
    
    except Exception as e:
        logging.error(f"Razorpay error: {e}")
        raise HTTPException(status_code=500, detail="Payment creation failed")

@api_router.post("/payment/verify")
async def verify_payment(payment: PaymentVerify, request: Request):
    """Verify Razorpay payment"""
    user = await require_auth(request)
    
    # For mock payments, just mark as complete
    if payment.razorpay_order_id.startswith("order_mock_"):
        # Update order
        await db.orders.update_one(
            {"razorpay_order_id": payment.razorpay_order_id},
            {"$set": {
                "razorpay_payment_id": payment.razorpay_payment_id,
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Get order to determine tier
        order = await db.orders.find_one(
            {"razorpay_order_id": payment.razorpay_order_id},
            {"_id": 0}
        )
        
        if order:
            # Update user tier
            await db.users.update_one(
                {"user_id": user.user_id},
                {"$set": {"tier": order["tier"]}}
            )
        
        return {"success": True, "message": "Payment verified (MOCK)"}
    
    # Verify real payment
    if not razorpay_client:
        raise HTTPException(status_code=400, detail="Payment verification not available")
    
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_signature': payment.razorpay_signature
        })
        
        # Update order
        await db.orders.update_one(
            {"razorpay_order_id": payment.razorpay_order_id},
            {"$set": {
                "razorpay_payment_id": payment.razorpay_payment_id,
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Get order
        order = await db.orders.find_one(
            {"razorpay_order_id": payment.razorpay_order_id},
            {"_id": 0}
        )
        
        if order:
            # Update user tier
            await db.users.update_one(
                {"user_id": user.user_id},
                {"$set": {"tier": order["tier"]}}
            )
        
        return {"success": True, "message": "Payment verified"}
    
    except Exception as e:
        logging.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")

# ==================== STATS ENDPOINTS ====================

@api_router.get("/stats")
async def get_stats():
    """Get public stats for landing page"""
    user_count = await db.users.count_documents({})
    founding_count = await db.users.count_documents({"is_founding_member": True})
    wedding_count = await db.weddings.count_documents({})
    
    # Add some base numbers for social proof
    return {
        "totalCouples": max(user_count + 1247, 1247),
        "foundingMembersRemaining": max(100 - founding_count, 0),
        "weddingsCreated": wedding_count,
        "rating": 4.9
    }

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "InviteAI API v1.0", "status": "running"}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
