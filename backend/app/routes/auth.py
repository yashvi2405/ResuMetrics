from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from app.database.db_manager import get_db, get_next_sequence_value
from app.models.user import User
from app.config import Config

router = APIRouter(prefix="/api/auth", tags=["authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Request Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response Models
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str

class RegisterResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    date_of_registration: datetime
    last_login_time: Optional[datetime]

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # Convert sub to string — JWT spec says sub should always be a string
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, Config.SECRET_KEY, algorithm=Config.ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), 
                      db = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = int(user_id)  # ← Convert string back to int for DB query
    except (jwt.JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db["users"].find_one({"user_id": user_id})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)

# Test endpoint to check if auth is working
@router.get("/test")
async def test_auth():
    return {"message": "Auth routes are working"}

# Register Endpoint
@router.post("/register", response_model=RegisterResponse)
async def register(user_data: UserRegister, db = Depends(get_db)):
    """
    Register a new user
    """
    try:
        # Check if user exists
        existing_user = await db["users"].find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user_id = await get_next_sequence_value("user_id")
        user_doc = {
            "user_id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "role": "user",
            "date_of_registration": datetime.utcnow()
        }
        await db["users"].insert_one(user_doc)
        
        return RegisterResponse(
            success=True,
            message="Registration successful",
            access_token=create_access_token(data={"sub": user_id}),
            token_type="bearer",
            user_id=user_id,
            name=user_data.name,
            email=user_data.email
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=LoginResponse)
async def login(user_data: UserLogin, db = Depends(get_db)):
    """
    Login user and return access token
    """
    try:
        # Find user by email
        user_doc = await db["users"].find_one({"email": user_data.email})
        
        # Check if user exists and password is correct
        if not user_doc or not verify_password(user_data.password, user_doc["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid email or password"
            )
        
        # Update last login time
        await db["users"].update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {"last_login_time": datetime.utcnow()}}
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": user_doc["user_id"]})
        
        return LoginResponse(
            success=True,
            message="Login successful",
            access_token=access_token,
            token_type="bearer",
            user_id=user_doc["user_id"],
            name=user_doc["name"],
            email=user_doc["email"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

# Get Current User Info Endpoint
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user information
    """
    return UserResponse(
        id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        date_of_registration=current_user.date_of_registration,
        last_login_time=current_user.last_login_time
    )

# Logout Endpoint
@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user (client should remove token)
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }

# Refresh Token Endpoint
@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """
    Refresh access token
    """
    try:
        new_token = create_access_token(data={"sub": current_user.user_id})
        return {
            "success": True,
            "access_token": new_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

# Change Password Endpoint
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Change user password
    """
    if not verify_password(password_data.old_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect"
        )
    
    await db["users"].update_one(
        {"user_id": current_user.user_id},
        {"$set": {"password": get_password_hash(password_data.new_password)}}
    )
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }