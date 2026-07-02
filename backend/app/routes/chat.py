from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.routes.auth import get_current_user
from app.models.user import User
from app.config import Config
import httpx

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


class ChatMessage(BaseModel):
    role: str        # "user" | "assistant" | "system"
    content: str


class ChatRequest(BaseModel):
    api_key: Optional[str] = None
    system_prompt: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7


class ChatResponse(BaseModel):
    reply: str


@router.post("/groq", response_model=ChatResponse)
async def groq_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Backend proxy for the Groq Chat Completions API.
    Uses the server-side API key if none is provided in the request.
    """
    api_key = request.api_key or Config.GROQ_API_KEY
    if not api_key or not api_key.strip() or api_key == "your_groq_api_key_here":
        raise HTTPException(
            status_code=400, 
            detail="Groq API key is not configured on the server. Please set GROQ_API_KEY in the backend .env file."
        )

    # Build message array: system prompt first, then conversation history
    groq_messages = [{"role": "system", "content": request.system_prompt}]
    for msg in request.messages:
        groq_messages.append({"role": msg.role, "content": msg.content})

    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": groq_messages,
        "temperature": request.temperature,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)

        if response.status_code == 401:
            raise HTTPException(
                status_code=401,
                detail="Invalid Groq API Key. Please check your key in Settings."
            )
        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Groq API rate limit exceeded. Please try again shortly."
            )
        if response.status_code != 200:
            error_body = response.json()
            error_msg = error_body.get("error", {}).get("message", f"Groq API returned HTTP {response.status_code}")
            raise HTTPException(status_code=response.status_code, detail=error_msg)

        data = response.json()
        reply_text = data["choices"][0]["message"]["content"]
        return ChatResponse(reply=reply_text)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Groq API timed out. Please try again.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Network error communicating with Groq: {str(e)}")
