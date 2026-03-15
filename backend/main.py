"""
Universal Document Creator - FastAPI Backend
AI-powered document generation with multi-model support
Real authentication, SQLite database, PDF engine, brand style extraction
"""

import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import re
import base64
import asyncio
import aiofiles
import sqlite3
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor

# Thread pool for blocking calls (Ollama, PDF, etc.)
_executor = ThreadPoolExecutor(max_workers=4)

# PDF generation
from xhtml2pdf import pisa

# Gemini (new SDK)
from google import genai
from google.genai import types as genai_types

# Ollama (connects to Docker container on port 11434)
from ollama import Client as OllamaClientClass
ollama_client = OllamaClientClass(host="http://localhost:11434", timeout=120)

# Image processing
from PIL import Image

app = FastAPI(
    title="Universal Document Creator API",
    description="AI-powered document generation with multi-model support",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SKILLS_FILE = os.path.join(os.path.dirname(__file__), "skills.md")
UPLOADED_SKILLS_DIR = os.path.join(os.path.dirname(__file__), "uploaded_skills")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
DB_PATH = os.path.join(os.path.dirname(__file__), "udc.db")
OUTPUT_DIR = "C:/UniversalDoc_Output"
os.makedirs(OUTPUT_DIR, exist_ok=True)
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72

# API Keys (loaded from environment or set via settings endpoint)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Ensure directories exist
os.makedirs(UPLOADED_SKILLS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Security
security = HTTPBearer(auto_error=False)

# ==================== MODEL DEFINITIONS ====================

AVAILABLE_MODELS = [
    {
        "id": "gemini-3-flash-preview",
        "name": "Gemini 3 Flash",
        "provider": "google",
        "description": "Google's frontier model — fast, pro-grade reasoning, vision capable",
        "vision": True,
        "censored": True,
        "tag": "Recommended"
    },
    {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "provider": "google",
        "description": "Google's previous gen — fast, high quality, vision capable",
        "vision": True,
        "censored": True,
        "tag": ""
    },
    {
        "id": "qwen2.5vl:7b",
        "name": "Qwen Vision (Unrestricted)",
        "provider": "ollama",
        "description": "Local AI — vision capable, no content restrictions",
        "vision": True,
        "censored": False,
        "tag": "Unrestricted"
    },
    {
        "id": "dolphin3:8b",
        "name": "Dolphin 3 (Fast)",
        "provider": "ollama",
        "description": "Local AI — fast text generation, no content restrictions",
        "vision": False,
        "censored": False,
        "tag": "Fast"
    },
    {
        "id": "claude-sonnet-4-20250514",
        "name": "Claude Sonnet 4",
        "provider": "anthropic",
        "description": "Anthropic's best all-round model — excellent writing, reasoning, analysis",
        "vision": True,
        "censored": True,
        "tag": "Premium"
    },
    {
        "id": "claude-haiku-4-5-20251001",
        "name": "Claude Haiku 4.5",
        "provider": "anthropic",
        "description": "Anthropic's fastest model — great for quick drafts and simple docs",
        "vision": True,
        "censored": True,
        "tag": "Fast"
    },
]

# Image generation models (separate from text models)
IMAGE_MODELS = [
    {
        "id": "gemini-3-pro-image-preview",
        "name": "Gemini 3 Pro Image",
        "provider": "google",
        "description": "Best quality — reasons about design then generates stunning visuals",
        "tag": "Recommended"
    },
    {
        "id": "gemini-3.1-flash-image-preview",
        "name": "Gemini 3.1 Flash Image",
        "provider": "google",
        "description": "Latest Flash — fast with great quality, smart design reasoning",
        "tag": "Latest"
    },
    {
        "id": "gemini-2.5-flash-image",
        "name": "Gemini 2.5 Flash Image",
        "provider": "google",
        "description": "Stable image generation with text+image mixed output",
        "tag": ""
    },
    {
        "id": "imagen-4.0-generate-001",
        "name": "Imagen 4",
        "provider": "google",
        "description": "Dedicated image generator — photorealistic, no text reasoning",
        "tag": ""
    },
    {
        "id": "imagen-4.0-fast-generate-001",
        "name": "Imagen 4 Fast",
        "provider": "google",
        "description": "Fastest image generation — good for quick drafts",
        "tag": "Fast"
    },
]

# ==================== DATABASE ====================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'free',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT 'Untitled Document',
            content TEXT NOT NULL,
            html_content TEXT,
            skill_used TEXT,
            prompt TEXT,
            model_used TEXT,
            brand_style TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS brand_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL DEFAULT 'My Brand',
            primary_color TEXT DEFAULT '#2563eb',
            secondary_color TEXT DEFAULT '#64748b',
            accent_color TEXT DEFAULT '#f59e0b',
            font_family TEXT DEFAULT 'Arial, sans-serif',
            logo_url TEXT,
            screenshot_path TEXT,
            style_json TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
        CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
async def startup():
    init_db()

# ==================== AUTH HELPERS ====================

def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()

def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub")
    conn = get_db()
    user = conn.execute("SELECT id, email, name, plan, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        conn = get_db()
        user = conn.execute("SELECT id, email, name, plan, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        if user:
            return dict(user)
    except Exception:
        pass
    return None

# ==================== DATA MODELS ====================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    plan: str
    created_at: str

class AuthResponse(BaseModel):
    user: UserResponse
    token: str

class SkillInput(BaseModel):
    name: str
    type: str = "string"
    description: str
    required: bool = True

class SkillDefinition(BaseModel):
    name: str
    description: str
    inputs: Dict[str, Any]
    outputs: str
    template: str

class DocumentRequest(BaseModel):
    skill_name: Optional[str] = None
    prompt: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    model: str = "gemini-3-flash-preview"
    temperature: float = 0.7
    max_tokens: int = 4000
    title: Optional[str] = None
    brand_profile_id: Optional[int] = None
    output_format: str = "markdown"  # markdown, html, pdf

class DocumentResponse(BaseModel):
    content: str
    html_content: Optional[str] = None
    skill_used: Optional[str] = None
    model_used: str
    export_formats: List[str] = ["text", "markdown", "html", "pdf"]
    generated_at: str
    document_id: Optional[int] = None

class SkillChainRequest(BaseModel):
    chain: List[Dict[str, Any]]
    initial_prompt: str
    model: str = "gemini-3-flash-preview"

class RefinementRequest(BaseModel):
    previous_content: str
    feedback: str
    skill_name: Optional[str] = None
    model: str = "gemini-3-flash-preview"

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class BrandProfileRequest(BaseModel):
    name: str = "My Brand"

class ApiKeyUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

# ==================== AI GENERATION ENGINE ====================

async def generate_with_gemini(prompt: str, model_name: str = "gemini-3-flash-preview",
                                temperature: float = 0.7,
                                max_tokens: int = 4000, image_data: bytes = None) -> str:
    """Generate using Google Gemini API (new SDK)"""
    api_key = GEMINI_API_KEY

    # Check DB for stored key if env var not set
    if not api_key:
        conn = get_db()
        row = conn.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'").fetchone()
        conn.close()
        if row:
            api_key = row["value"]

    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API key not configured. Go to Settings to add it.")

    try:
        client = genai.Client(api_key=api_key)

        config = genai_types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        contents = []
        if image_data:
            # Vision request — include image
            image = Image.open(BytesIO(image_data))
            contents = [prompt, image]
        else:
            contents = prompt

        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )

        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")


async def generate_with_ollama(prompt: str, model_name: str = "dolphin3:8b",
                                temperature: float = 0.7, image_data: bytes = None) -> str:
    """Generate using local Ollama model (Docker container)"""
    try:
        messages = [{"role": "user", "content": prompt}]

        if image_data:
            img_b64 = base64.b64encode(image_data).decode("utf-8")
            messages = [{
                "role": "user",
                "content": prompt,
                "images": [img_b64]
            }]

        def _call_ollama():
            return ollama_client.chat(
                model=model_name,
                messages=messages,
                options={"temperature": temperature}
            )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(_executor, _call_ollama)
        return response.message.content
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower() or "pull" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail=f"Model '{model_name}' not installed. Run: docker exec ollama ollama pull {model_name}"
            )
        if "connection" in error_msg.lower() or "refused" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Ollama is not running. Start the Docker container: docker start ollama"
            )
        raise HTTPException(status_code=500, detail=f"Ollama error: {error_msg}")


async def generate_with_anthropic(prompt: str, model_name: str = "claude-sonnet-4-20250514",
                                   temperature: float = 0.7, max_tokens: int = 4000,
                                   image_data: bytes = None) -> str:
    """Generate using Anthropic Claude API"""
    api_key = ANTHROPIC_API_KEY
    if not api_key:
        conn = get_db()
        row = conn.execute("SELECT value FROM settings WHERE key = 'anthropic_api_key'").fetchone()
        conn.close()
        if row:
            api_key = row["value"]
    if not api_key:
        raise HTTPException(status_code=400, detail="Anthropic API key not configured. Go to Settings to add it.")

    try:
        import httpx
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        messages = [{"role": "user", "content": prompt}]
        if image_data:
            img_b64 = base64.b64encode(image_data).decode("utf-8")
            messages = [{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
                {"type": "text", "text": prompt}
            ]}]

        payload = {
            "model": model_name,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages
        }

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)

        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Anthropic error: {resp.text}")

        data = resp.json()
        return data["content"][0]["text"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anthropic error: {str(e)}")


async def generate_image(prompt: str, model_id: str = "gemini-3-pro-image-preview",
                          aspect_ratio: str = "1:1") -> bytes:
    """Generate an image using Google Imagen or Gemini image models"""
    api_key = GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API key required for image generation")

    try:
        if model_id.startswith("imagen"):
            # Imagen API — uses :predict endpoint
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:predict?key={api_key}"
            payload = {
                "instances": [{"prompt": prompt}],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": aspect_ratio,
                    "personGeneration": "allow_adult"
                }
            }
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Imagen error: {resp.text}")
            data = resp.json()
            return base64.b64decode(data["predictions"][0]["bytesBase64Encoded"])
        else:
            # Gemini native image gen — uses generateContent with responseModalities
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent"
            headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "imageConfig": {"aspectRatio": aspect_ratio}
                }
            }
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=f"Gemini image error: {resp.text}")
            data = resp.json()
            for part in data["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])
            raise HTTPException(status_code=500, detail="No image in response")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")


async def generate_content(prompt: str, model_id: str = "gemini-3-flash-preview",
                           temperature: float = 0.7, max_tokens: int = 4000,
                           image_data: bytes = None) -> str:
    """Route to the right AI provider based on model selection"""

    # Find model config
    model_config = next((m for m in AVAILABLE_MODELS if m["id"] == model_id), None)

    if not model_config:
        raise HTTPException(status_code=400, detail=f"Unknown model: {model_id}")

    provider = model_config["provider"]

    if provider == "google":
        return await generate_with_gemini(prompt, model_id, temperature, max_tokens, image_data)
    elif provider == "ollama":
        return await generate_with_ollama(prompt, model_id, temperature, image_data)
    elif provider == "anthropic":
        return await generate_with_anthropic(prompt, model_id, temperature, max_tokens, image_data)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

# ==================== PDF ENGINE ====================

DOCUMENT_CSS = """
@page {
    size: A4;
    margin: 2cm;
}
body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 100%;
}
h1 {
    font-size: 24pt;
    color: {primary_color};
    border-bottom: 3px solid {primary_color};
    padding-bottom: 8px;
    margin-top: 20px;
    margin-bottom: 15px;
}
h2 {
    font-size: 18pt;
    color: {secondary_color};
    margin-top: 25px;
    margin-bottom: 10px;
}
h3 {
    font-size: 14pt;
    color: #444;
    margin-top: 18px;
    margin-bottom: 8px;
}
p {
    margin: 8px 0;
    text-align: justify;
}
ul, ol {
    margin: 10px 0;
    padding-left: 25px;
}
li {
    margin: 4px 0;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
}
th {
    background-color: {primary_color};
    color: white;
    padding: 10px 12px;
    text-align: left;
    font-weight: bold;
}
td {
    padding: 8px 12px;
    border-bottom: 1px solid #e0e0e0;
}
tr:nth-child(even) td {
    background-color: #f8f9fa;
}
blockquote {
    border-left: 4px solid {accent_color};
    padding: 10px 20px;
    margin: 15px 0;
    background-color: #fafafa;
    font-style: italic;
}
code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
}
pre {
    background-color: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    line-height: 1.4;
}
.header-bar {
    background-color: {primary_color};
    color: white;
    padding: 20px 25px;
    margin: -2cm -2cm 25px -2cm;
    text-align: center;
}
.header-bar h1 {
    color: white;
    border: none;
    margin: 0;
    padding: 0;
    font-size: 28pt;
}
.header-bar .subtitle {
    color: rgba(255,255,255,0.85);
    font-size: 12pt;
    margin-top: 5px;
}
.footer {
    text-align: center;
    font-size: 8pt;
    color: #999;
    margin-top: 40px;
    padding-top: 10px;
    border-top: 1px solid #e0e0e0;
}
.badge {
    display: inline-block;
    background-color: {accent_color};
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 9pt;
    font-weight: bold;
}
strong {
    color: #111;
}
hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 20px 0;
}
"""

def markdown_to_html(md_content: str) -> str:
    """Convert markdown to HTML (basic conversion)"""
    html = md_content

    # Headers (process longest first so #### doesn't match as # + ###)
    html = re.sub(r'^###### (.+)$', r'<h6>\1</h6>', html, flags=re.MULTILINE)
    html = re.sub(r'^##### (.+)$', r'<h5>\1</h5>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold and italic
    html = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Code blocks — extract content between ``` fences, escape HTML inside
    def _code_block_replace(m):
        code = m.group(1)
        code = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f'<pre><code>{code}</code></pre>'
    html = re.sub(r'```[\w]*\n(.*?)```', _code_block_replace, html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)

    # Blockquotes
    html = re.sub(r'^> (.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)

    # Horizontal rules
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)

    # Tables — convert markdown pipe tables to HTML before list processing
    table_lines = html.split('\n')
    table_result = []
    in_table = False
    header_done = False
    for i, line in enumerate(table_lines):
        stripped = line.strip()
        if re.match(r'^\|(.+)\|$', stripped):
            cells = [c.strip() for c in stripped.strip('|').split('|')]
            # Check if next line is a separator (|---|---|)
            is_separator = all(re.match(r'^[-:]+$', c) for c in cells)
            if is_separator:
                header_done = True
                continue
            if not in_table:
                table_result.append('<table>')
                in_table = True
                header_done = False
            if not header_done and in_table:
                # This is the header row
                table_result.append('<thead><tr>')
                for c in cells:
                    table_result.append(f'<th>{c}</th>')
                table_result.append('</tr></thead><tbody>')
            else:
                table_result.append('<tr>')
                for c in cells:
                    table_result.append(f'<td>{c}</td>')
                table_result.append('</tr>')
        else:
            if in_table:
                table_result.append('</tbody></table>')
                in_table = False
                header_done = False
            table_result.append(line)
    if in_table:
        table_result.append('</tbody></table>')
    html = '\n'.join(table_result)

    # Unordered lists
    lines = html.split('\n')
    result = []
    in_list = False
    in_ol = False
    for line in lines:
        stripped = line.strip()
        if re.match(r'^[-*] ', stripped):
            if not in_list:
                result.append('<ul>')
                in_list = True
            item = re.sub(r'^[-*] ', '', stripped)
            result.append(f'<li>{item}</li>')
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            # Ordered lists
            ol_match = re.match(r'^(\d+)\. (.+)', stripped)
            if ol_match:
                if not in_ol:
                    result.append('<ol>')
                    in_ol = True
                result.append(f'<li>{ol_match.group(2)}</li>')
            elif stripped:
                if in_ol:
                    result.append('</ol>')
                    in_ol = False
                # Wrap plain text in <p> if not already an HTML tag
                if not stripped.startswith('<'):
                    result.append(f'<p>{stripped}</p>')
                else:
                    result.append(stripped)
            else:
                if in_ol:
                    result.append('</ol>')
                    in_ol = False
                result.append('')
    if in_list:
        result.append('</ul>')
    if in_ol:
        result.append('</ol>')

    return '\n'.join(result)


def generate_pdf_bytes(html_content: str, brand_style: dict = None, include_footer: bool = True) -> bytes:
    """Generate PDF from HTML content using xhtml2pdf"""
    style = brand_style or {}
    primary = style.get("primary_color", "#2563eb")
    secondary = style.get("secondary_color", "#64748b")
    accent = style.get("accent_color", "#f59e0b")
    font = style.get("font_family", "Helvetica, Arial, sans-serif")

    css = DOCUMENT_CSS.replace("{primary_color}", primary)\
                       .replace("{secondary_color}", secondary)\
                       .replace("{accent_color}", accent)\
                       .replace("{font_family}", font)

    footer_html = '<div class="footer">Generated by Universal Document Creator</div>' if include_footer else ''

    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>{css}</style>
</head>
<body>
{html_content}
{footer_html}
</body>
</html>"""

    buffer = BytesIO()
    pisa_status = pisa.CreatePDF(full_html, dest=buffer)

    if pisa_status.err:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    return buffer.getvalue()

# ==================== BRAND STYLE EXTRACTION ====================

async def extract_brand_style(image_data: bytes, model_id: str = "gemini-3-flash-preview") -> dict:
    """Use vision AI to extract brand colors/style from a website screenshot"""
    prompt = """Analyze this website screenshot and extract the brand style. Return ONLY valid JSON with these fields:
{
    "primary_color": "#hex color of the main/primary brand color",
    "secondary_color": "#hex color of the secondary color",
    "accent_color": "#hex color used for buttons/CTAs/highlights",
    "background_color": "#hex background color",
    "text_color": "#hex main text color",
    "font_family": "detected or closest matching web-safe font family",
    "style_description": "brief description of the overall design style",
    "logo_position": "left/center/right - where the logo appears"
}
Return ONLY the JSON, no markdown formatting, no explanation."""

    result = await generate_content(prompt, model_id, temperature=0.1, image_data=image_data)

    # Parse JSON from response
    try:
        # Try to extract JSON from response
        json_match = re.search(r'\{[^{}]*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(result)
    except json.JSONDecodeError:
        # Return defaults if parsing fails
        return {
            "primary_color": "#2563eb",
            "secondary_color": "#64748b",
            "accent_color": "#f59e0b",
            "background_color": "#ffffff",
            "text_color": "#1a1a1a",
            "font_family": "Arial, sans-serif",
            "style_description": "Could not parse style from screenshot",
            "logo_position": "left"
        }

# ==================== SKILLS SYSTEM ====================

def parse_skills_from_markdown(content: str) -> List[SkillDefinition]:
    skills = []
    skill_blocks = re.split(r'### Skill:', content)

    for block in skill_blocks[1:]:
        lines = block.strip().split('\n')
        skill_data = {
            "name": "", "description": "", "inputs": {},
            "outputs": "", "template": ""
        }
        current_section = None
        template_lines = []
        in_template = False

        for line in lines:
            line = line.strip()
            if line.startswith('- **Name**:'):
                skill_data["name"] = line.split(':', 1)[1].strip()
            elif line.startswith('- **Description**:'):
                skill_data["description"] = line.split(':', 1)[1].strip()
            elif line.startswith('- **Inputs**:'):
                current_section = "inputs"
            elif line.startswith('- **Outputs**:'):
                skill_data["outputs"] = line.split(':', 1)[1].strip()
                current_section = None
            elif line.startswith('- **Template**:'):
                in_template = True
                template_part = line.split(':', 1)[1].strip()
                if template_part and template_part != '|':
                    template_lines.append(template_part)
            elif in_template:
                if line.startswith('- '):
                    in_template = False
                else:
                    template_lines.append(line.lstrip('| '))
            elif current_section == "inputs" and line.startswith('- '):
                input_match = re.match(r'-\s+(\w+)\s+\(([^)]+)\):\s*(.+)', line)
                if input_match:
                    skill_data["inputs"][input_match.group(1)] = {
                        "type": input_match.group(2),
                        "description": input_match.group(3)
                    }

        skill_data["template"] = '\n'.join(template_lines).strip()
        if skill_data["name"]:
            skills.append(SkillDefinition(**skill_data))
    return skills

def load_all_skills() -> List[SkillDefinition]:
    all_skills = []
    try:
        with open(SKILLS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        all_skills.extend(parse_skills_from_markdown(content))
    except Exception as e:
        print(f"Error loading built-in skills: {e}")
    try:
        for filename in os.listdir(UPLOADED_SKILLS_DIR):
            if filename.endswith('.md'):
                filepath = os.path.join(UPLOADED_SKILLS_DIR, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                all_skills.extend(parse_skills_from_markdown(content))
    except Exception as e:
        print(f"Error loading uploaded skills: {e}")
    return all_skills

def get_skill_by_name(name: str) -> Optional[SkillDefinition]:
    for skill in load_all_skills():
        if skill.name.lower() == name.lower():
            return skill
    return None

def apply_skill_template(skill: SkillDefinition, parameters: Dict[str, Any]) -> str:
    template = skill.template
    for key, value in parameters.items():
        placeholder = "{" + key + "}"
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        template = template.replace(placeholder, str(value))
    # Remove ICU select blocks for undefined optional params: {var, select, undefined {} other {text}}
    template = re.sub(r'\{[^}]+,\s*select,\s*undefined\s*\{\}\s*other\s*\{[^}]*\}\}', '', template)
    return template

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=AuthResponse)
async def register_user(req: RegisterRequest):
    if not req.email or not req.password or not req.name:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=409, detail="Email already registered")

    salt = secrets.token_hex(16)
    password_hash = hash_password(req.password, salt)
    cursor = conn.execute(
        "INSERT INTO users (email, name, password_hash, salt, plan) VALUES (?, ?, ?, ?, ?)",
        (req.email.lower(), req.name, password_hash, salt, "free")
    )
    conn.commit()
    user_id = cursor.lastrowid
    user = conn.execute("SELECT id, email, name, plan, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    return AuthResponse(user=UserResponse(**dict(user)), token=create_token(user_id, req.email.lower()))

@app.post("/api/auth/login", response_model=AuthResponse)
async def login_user(req: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email.lower(),)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if hash_password(req.password, user["salt"]) != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"],
                          plan=user["plan"], created_at=user["created_at"]),
        token=create_token(user["id"], user["email"])
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(**user)

# ==================== SETTINGS ENDPOINTS ====================

@app.post("/api/settings/api-keys")
async def update_api_keys(req: ApiKeyUpdate, user=Depends(get_current_user)):
    """Save API keys to database"""
    conn = get_db()
    if req.gemini_api_key is not None:
        conn.execute(
            "INSERT INTO settings (key, value) VALUES ('gemini_api_key', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = ?",
            (req.gemini_api_key, req.gemini_api_key)
        )
    if req.anthropic_api_key is not None:
        conn.execute(
            "INSERT INTO settings (key, value) VALUES ('anthropic_api_key', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = ?",
            (req.anthropic_api_key, req.anthropic_api_key)
        )
        global ANTHROPIC_API_KEY
        ANTHROPIC_API_KEY = req.anthropic_api_key
    conn.commit()
    conn.close()
    return {"message": "API keys updated"}

@app.get("/api/settings/api-keys")
async def get_api_keys(user=Depends(get_current_user)):
    """Check which API keys are configured"""
    conn = get_db()
    gemini = conn.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'").fetchone()
    anthropic = conn.execute("SELECT value FROM settings WHERE key = 'anthropic_api_key'").fetchone()
    conn.close()
    return {
        "gemini_configured": bool(gemini) or bool(GEMINI_API_KEY),
        "anthropic_configured": bool(anthropic) or bool(ANTHROPIC_API_KEY),
    }

# ==================== BRAND PROFILE ENDPOINTS ====================

@app.post("/api/brand/upload-screenshot")
async def upload_brand_screenshot(
    file: UploadFile = File(...),
    name: str = Form("My Brand"),
    model: str = Form("gemini-3-flash-preview"),
    user=Depends(get_current_user)
):
    """Upload a website screenshot and extract brand style"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    image_data = await file.read()

    # Save screenshot
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    ext = file.filename.split('.')[-1] if file.filename else "png"
    filename = f"brand_{user['id']}_{timestamp}.{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(image_data)

    # Extract brand style using vision AI
    style = await extract_brand_style(image_data, model)

    # Save to database
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO brand_profiles (user_id, name, primary_color, secondary_color, accent_color, "
        "font_family, screenshot_path, style_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user["id"], name, style.get("primary_color", "#2563eb"),
         style.get("secondary_color", "#64748b"), style.get("accent_color", "#f59e0b"),
         style.get("font_family", "Arial, sans-serif"), filepath, json.dumps(style))
    )
    conn.commit()
    profile_id = cursor.lastrowid
    profile = conn.execute("SELECT * FROM brand_profiles WHERE id = ?", (profile_id,)).fetchone()
    conn.close()

    return {
        "profile": dict(profile),
        "extracted_style": style,
        "message": "Brand style extracted successfully"
    }

@app.get("/api/brand/profiles")
async def get_brand_profiles(user=Depends(get_current_user)):
    """Get all brand profiles for the user"""
    conn = get_db()
    profiles = conn.execute(
        "SELECT * FROM brand_profiles WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],)
    ).fetchall()
    conn.close()
    return {"profiles": [dict(p) for p in profiles]}

@app.delete("/api/brand/profiles/{profile_id}")
async def delete_brand_profile(profile_id: int, user=Depends(get_current_user)):
    conn = get_db()
    conn.execute("DELETE FROM brand_profiles WHERE id = ? AND user_id = ?", (profile_id, user["id"]))
    conn.commit()
    conn.close()
    return {"message": "Brand profile deleted"}

# ==================== DOCUMENT ENDPOINTS ====================

@app.get("/api/documents")
async def get_user_documents(user=Depends(get_current_user)):
    conn = get_db()
    docs = conn.execute(
        "SELECT id, title, skill_used, prompt, model_used, created_at, updated_at "
        "FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
        (user["id"],)
    ).fetchall()
    conn.close()
    return {"documents": [dict(d) for d in docs]}

@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: int, user=Depends(get_current_user)):
    conn = get_db()
    doc = conn.execute("SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])).fetchone()
    conn.close()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return dict(doc)

@app.get("/api/documents/{doc_id}/pdf")
async def get_document_pdf(doc_id: int, user=Depends(get_current_user)):
    """Download a document as PDF"""
    conn = get_db()
    doc = conn.execute("SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])).fetchone()
    conn.close()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get brand style if linked
    brand_style = json.loads(doc["brand_style"]) if doc["brand_style"] else None

    html = doc["html_content"] or markdown_to_html(doc["content"])
    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(_executor, generate_pdf_bytes, html, brand_style)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["title"]}.pdf"'}
    )

@app.put("/api/documents/{doc_id}")
async def update_document(doc_id: int, update: DocumentUpdate, user=Depends(get_current_user)):
    conn = get_db()
    doc = conn.execute("SELECT id FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])).fetchone()
    if not doc:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    updates, values = [], []
    if update.title is not None:
        updates.append("title = ?")
        values.append(update.title)
    if update.content is not None:
        updates.append("content = ?")
        values.append(update.content)
        updates.append("html_content = ?")
        values.append(markdown_to_html(update.content))

    if updates:
        updates.append("updated_at = datetime('now')")
        values.extend([doc_id, user["id"]])
        conn.execute(f"UPDATE documents SET {', '.join(updates)} WHERE id = ? AND user_id = ?", values)
        conn.commit()

    updated = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    return dict(updated)

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: int, user=Depends(get_current_user)):
    conn = get_db()
    doc = conn.execute("SELECT id FROM documents WHERE id = ? AND user_id = ?", (doc_id, user["id"])).fetchone()
    if not doc:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")
    conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return {"message": "Document deleted"}

# ==================== GENERATION ENDPOINTS ====================

@app.get("/")
async def root():
    # In desktop mode (dist/ exists), serve the frontend
    dist_dir = os.path.join(os.path.dirname(__file__), "..", "dist")
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path, media_type="text/html")
    # Fallback: API info for dev mode
    return {
        "message": "Universal Document Creator API",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "skills": "/api/skills",
            "generate": "/api/generate",
            "documents": "/api/documents",
            "brand": "/api/brand",
            "models": "/api/models",
            "settings": "/api/settings"
        }
    }

@app.get("/api/skills")
async def get_skills():
    skills = load_all_skills()
    return {"skills": [skill.model_dump() for skill in skills], "count": len(skills)}

@app.get("/api/skills/{skill_name}")
async def get_skill(skill_name: str):
    skill = get_skill_by_name(skill_name)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found")
    return skill.model_dump()

def render_business_card_html(params: dict) -> str:
    """Render a visual business card as styled HTML — xhtml2pdf compatible."""
    name = params.get("full_name", "Your Name")
    title = params.get("job_title", "Your Title")
    company = params.get("company_name", "Company")
    email = params.get("email", "")
    phone = params.get("phone", "")
    website = params.get("website", "")
    tagline = params.get("tagline", "")
    # xhtml2pdf only supports basic CSS — use tables for layout, solid backgrounds, no gradients
    contact_rows = ""
    if email:
        contact_rows += f'<tr><td style="padding:8px 16px;color:#666666;font-size:10pt;width:70px;">EMAIL</td><td style="padding:8px 16px;font-size:11pt;color:#1a1a2e;font-weight:bold;">{email}</td></tr>'
    if phone:
        contact_rows += f'<tr><td style="padding:8px 16px;color:#666666;font-size:10pt;width:70px;">PHONE</td><td style="padding:8px 16px;font-size:11pt;color:#1a1a2e;font-weight:bold;">{phone}</td></tr>'
    if website:
        contact_rows += f'<tr><td style="padding:8px 16px;color:#666666;font-size:10pt;width:70px;">WEB</td><td style="padding:8px 16px;font-size:11pt;color:#1a1a2e;font-weight:bold;">{website}</td></tr>'
    tagline_html = f'<tr><td colspan="2" style="padding:14px 32px 0 32px;"><table width="100%"><tr><td style="border-top:2px solid #0891b2;padding-top:12px;font-size:10pt;color:#0891b2;font-style:italic;">&ldquo;{tagline}&rdquo;</td></tr></table></td></tr>' if tagline else ''

    return f'''<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;">
<tr><td style="padding:20px 0;">

<!-- FRONT SIDE LABEL -->
<table width="100%" style="margin-bottom:8px;"><tr><td style="font-size:9pt;color:#999999;text-transform:uppercase;letter-spacing:2px;">&#9632; Front Side</td></tr></table>

<!-- FRONT OF CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #0f172a;">
<tr><td style="padding:24px 32px 6px 32px;font-size:9pt;color:#0891b2;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">{company}</td></tr>
<tr><td style="padding:4px 32px 4px 32px;font-size:22pt;color:#ffffff;font-weight:bold;">{name}</td></tr>
<tr><td style="padding:2px 32px 16px 32px;font-size:11pt;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">{title}</td></tr>
{tagline_html}
<tr><td style="padding:0 32px 4px 32px;"><table width="100%"><tr><td style="border-top:1px solid #1e3a5f;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:0 32px 20px 32px;font-size:8pt;color:#475569;">{company} &bull; Innovation &bull; Excellence</td></tr>
</table>

<!-- SPACING -->
<table width="100%"><tr><td style="padding:10px 0;">&nbsp;</td></tr></table>

<!-- BACK SIDE LABEL -->
<table width="100%" style="margin-bottom:8px;"><tr><td style="font-size:9pt;color:#999999;text-transform:uppercase;letter-spacing:2px;">&#9632; Back Side</td></tr></table>

<!-- BACK OF CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;">
<tr><td style="padding:20px 32px 8px 32px;">
  <table width="100%"><tr><td style="font-size:9pt;color:#0891b2;letter-spacing:2px;text-transform:uppercase;font-weight:bold;border-bottom:2px solid #0891b2;padding-bottom:10px;">{company}</td></tr></table>
</td></tr>
<tr><td style="padding:8px 16px 20px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;">
    {contact_rows}
  </table>
</td></tr>
</table>

<!-- FOOTER -->
<table width="100%" style="margin-top:6px;"><tr><td style="text-align:center;font-size:7pt;color:#cccccc;padding-top:4px;">Generated by Universal Document Creator</td></tr></table>

</td></tr></table>'''


def render_receipt_html(params: dict, items_text: str = "") -> str:
    """Render a professional receipt as styled HTML — no LLM needed for layout."""
    biz = params.get("business_name", "Business")
    customer = params.get("customer_name", "Customer")
    payment = params.get("payment_method", "Cash")
    tax_rate = params.get("tax_rate", "0")
    receipt_no = params.get("receipt_number", f"R-{datetime.utcnow().strftime('%Y%m%d%H%M')}")
    date_str = datetime.utcnow().strftime("%B %d, %Y  %I:%M %p")

    # Parse items from the prompt text (look for price patterns)
    # This is best-effort — the LLM will generate the content, we just style it
    return None  # Let LLM handle receipt content, we just fix the output format


@app.post("/api/generate", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest, user=Depends(get_optional_user)):
    """Generate a document with selected AI model"""
    prompt = request.prompt
    skill_used = None

    # Business Card — use dedicated visual template, skip LLM for layout
    if request.skill_name and request.skill_name.lower() == "business card" and request.parameters:
        card_html = render_business_card_html(request.parameters)
        skill_used = "Business Card"
        content = f"# Business Card — {request.parameters.get('full_name', '')}\n\n{request.parameters.get('job_title', '')} at {request.parameters.get('company_name', '')}"
        html_content = card_html

        # Save + return early
        document_id = None
        if user:
            conn = get_db()
            title = request.title or f"Business Card - {request.parameters.get('full_name', '')}"
            cursor = conn.execute(
                "INSERT INTO documents (user_id, title, content, html_content, skill_used, prompt, model_used, brand_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (user["id"], title, content, html_content, skill_used, request.prompt, request.model, None)
            )
            conn.commit()
            document_id = cursor.lastrowid
            conn.close()

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        try:
            pdf_bytes = generate_pdf_bytes(html_content, None, include_footer=False)
            with open(os.path.join(OUTPUT_DIR, f"Business_Card_{timestamp}.pdf"), "wb") as f:
                f.write(pdf_bytes)
        except Exception:
            pass

        return DocumentResponse(
            content=content, html_content=html_content, skill_used=skill_used,
            model_used="template", export_formats=["pdf", "markdown", "text"],
            generated_at=datetime.utcnow().isoformat(), document_id=document_id
        )

    # Apply skill template if selected
    if request.skill_name:
        skill = get_skill_by_name(request.skill_name)
        if skill:
            skill_prompt = apply_skill_template(skill, request.parameters)
            prompt = f"{skill_prompt}\n\nAdditional context: {request.prompt}"
            skill_used = skill.name
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{request.skill_name}' not found")

    # Get brand style if specified
    brand_style = None
    brand_style_instruction = ""
    if request.brand_profile_id and user:
        conn = get_db()
        profile = conn.execute(
            "SELECT * FROM brand_profiles WHERE id = ? AND user_id = ?",
            (request.brand_profile_id, user["id"])
        ).fetchone()
        conn.close()
        if profile and profile["style_json"]:
            brand_style = json.loads(profile["style_json"])
            brand_style_instruction = f"\n\nIMPORTANT - Style this document to match the following brand:\n- Primary color: {brand_style.get('primary_color')}\n- Secondary color: {brand_style.get('secondary_color')}\n- Style: {brand_style.get('style_description', 'professional')}\n- Use appropriate HTML formatting with inline styles matching these brand colors."

    # Adjust prompt for output format
    format_instruction = ""
    if request.output_format == "html":
        format_instruction = "\n\nGenerate this as clean, well-structured HTML with appropriate tags (h1, h2, p, ul, table, etc.). Include inline CSS for styling."
    elif request.output_format == "pdf":
        format_instruction = "\n\nGenerate this as clean HTML suitable for PDF conversion. Use proper heading hierarchy, tables, lists, and structure. Include inline CSS for professional styling."
    else:
        format_instruction = "\n\nGenerate this as well-formatted Markdown with proper headings, lists, tables, and emphasis."

    full_prompt = prompt + format_instruction + brand_style_instruction

    # Generate content
    content = await generate_content(
        prompt=full_prompt,
        model_id=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )

    # Generate HTML version
    html_content = None
    if request.output_format in ("html", "pdf"):
        html_content = content
    else:
        html_content = markdown_to_html(content)

    # Save document if user is authenticated
    document_id = None
    if user:
        conn = get_db()
        title = request.title or f"Document - {datetime.utcnow().strftime('%b %d, %Y %H:%M')}"
        cursor = conn.execute(
            "INSERT INTO documents (user_id, title, content, html_content, skill_used, prompt, model_used, brand_style) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (user["id"], title, content, html_content, skill_used, request.prompt,
             request.model, json.dumps(brand_style) if brand_style else None)
        )
        conn.commit()
        document_id = cursor.lastrowid
        conn.close()

    # Auto-save to output folder
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_skill = (skill_used or "General").replace(" ", "_")
    auto_filename = f"{safe_skill}_{timestamp}"
    try:
        # Save markdown
        md_path = os.path.join(OUTPUT_DIR, f"{auto_filename}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(content)
        # Save PDF
        pdf_html = html_content or markdown_to_html(content)
        pdf_bytes = generate_pdf_bytes(pdf_html, brand_style)
        pdf_path = os.path.join(OUTPUT_DIR, f"{auto_filename}.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)
    except Exception:
        pass  # Don't fail the response if auto-save has issues

    return DocumentResponse(
        content=content,
        html_content=html_content,
        skill_used=skill_used,
        model_used=request.model,
        generated_at=datetime.utcnow().isoformat(),
        document_id=document_id
    )

@app.post("/api/refine", response_model=DocumentResponse)
async def refine_document(request: RefinementRequest, user=Depends(get_optional_user)):
    refinement_prompt = f"""Please refine the following document based on the feedback provided.

ORIGINAL DOCUMENT:
{request.previous_content}

FEEDBACK FOR IMPROVEMENT:
{request.feedback}

Please provide an improved version that addresses all the feedback while maintaining the original purpose and structure."""

    content = await generate_content(refinement_prompt, request.model)

    return DocumentResponse(
        content=content,
        html_content=markdown_to_html(content),
        skill_used=request.skill_name,
        model_used=request.model,
        generated_at=datetime.utcnow().isoformat()
    )

@app.post("/api/chain")
async def chain_skills(request: SkillChainRequest):
    results = []
    current_content = request.initial_prompt

    for step in request.chain:
        skill_name = step.get("skill_name")
        parameters = step.get("parameters", {})
        skill = get_skill_by_name(skill_name)
        if not skill:
            raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found")

        parameters["previous_content"] = current_content
        prompt = apply_skill_template(skill, parameters)
        content = await generate_content(prompt, request.model)
        results.append({"skill": skill_name, "content": content})
        current_content = content

    return {"chain_results": results, "final_output": current_content, "steps": len(results)}

@app.post("/api/skills/upload")
async def upload_skill(file: UploadFile = File(...)):
    if not file.filename.endswith('.md'):
        raise HTTPException(status_code=400, detail="Only .md files are allowed")

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOADED_SKILLS_DIR, filename)

    try:
        content = await file.read()
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(content)
        skills = parse_skills_from_markdown(content.decode('utf-8'))
        return {
            "message": "Skill uploaded successfully",
            "filename": filename,
            "skills_added": len(skills),
            "skill_names": [s.name for s in skills]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading skill: {str(e)}")

# ==================== EXPORT ENDPOINTS ====================

@app.post("/api/export/pdf")
async def export_as_pdf(
    content: str = Form(...),
    filename: Optional[str] = Form(None),
    brand_profile_id: Optional[int] = Form(None),
    user=Depends(get_optional_user)
):
    """Export content as a styled PDF"""
    brand_style = None
    if brand_profile_id and user:
        conn = get_db()
        profile = conn.execute(
            "SELECT style_json FROM brand_profiles WHERE id = ? AND user_id = ?",
            (brand_profile_id, user["id"])
        ).fetchone()
        conn.close()
        if profile and profile["style_json"]:
            brand_style = json.loads(profile["style_json"])

    # If content is already HTML (from a template), use directly; skip extra footer if it has one
    is_raw_html = content.strip().startswith("<")
    html = content if is_raw_html else markdown_to_html(content)
    has_own_footer = "Generated by Universal Document Creator" in content
    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(_executor, generate_pdf_bytes, html, brand_style, not has_own_footer)

    base_filename = filename or f"document_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    # Auto-save copy to output folder
    save_path = os.path.join(OUTPUT_DIR, f"{base_filename}.pdf")
    with open(save_path, "wb") as f:
        f.write(pdf_bytes)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{base_filename}.pdf"'}
    )

@app.post("/api/export/{format}")
async def export_document(format: str, content: str = Form(...), filename: Optional[str] = Form(None)):
    """Export document in text or markdown format"""
    if format not in ["text", "markdown"]:
        raise HTTPException(status_code=400, detail="Format must be text, markdown, or pdf")

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    base_filename = filename or f"document_{timestamp}"

    if format == "text":
        ext = "txt"
    else:
        ext = "md"

    # Auto-save copy to output folder
    save_path = os.path.join(OUTPUT_DIR, f"{base_filename}.{ext}")
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"content": content, "filename": f"{base_filename}.{ext}", "mime_type": f"text/{'plain' if format == 'text' else 'markdown'}", "format": format}

@app.get("/api/models")
async def get_available_models():
    """Get list of available AI models with their capabilities"""
    def _check_models():
        results = []
        for model in AVAILABLE_MODELS:
            model_info = dict(model)
            if model["provider"] == "ollama":
                try:
                    ollama_client.show(model=model["id"])
                    model_info["installed"] = True
                except Exception:
                    model_info["installed"] = False
            else:
                model_info["installed"] = True
            results.append(model_info)
        return results

    loop = asyncio.get_event_loop()
    models_with_status = await loop.run_in_executor(_executor, _check_models)
    return {"models": models_with_status, "default": "gemini-3-flash-preview"}

@app.get("/api/image-models")
async def get_image_models():
    """Get available image generation models"""
    return {"models": IMAGE_MODELS, "default": "gemini-3-pro-image-preview"}


@app.post("/api/generate-image")
async def generate_image_endpoint(
    prompt: str = Form(...),
    model: str = Form("gemini-3-pro-image-preview"),
    aspect_ratio: str = Form("1:1"),
    filename: Optional[str] = Form(None)
):
    """Generate an image from a text prompt"""
    image_bytes = await generate_image(prompt, model, aspect_ratio)

    base_filename = filename or f"image_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    save_path = os.path.join(OUTPUT_DIR, f"{base_filename}.png")
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    # Return base64 + save path
    return {
        "image_base64": base64.b64encode(image_bytes).decode("utf-8"),
        "mime_type": "image/png",
        "saved_to": save_path,
        "filename": f"{base_filename}.png"
    }


# ==================== HEALTH CHECK ====================

@app.get("/api/health")
async def health_check():
    """Check system health"""
    status = {"api": "ok", "database": "ok", "ollama": "unknown", "gemini": "unknown"}

    # Check DB
    try:
        conn = get_db()
        conn.execute("SELECT 1")
        conn.close()
    except Exception:
        status["database"] = "error"

    # Check Ollama
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(_executor, ollama_client.list)
        status["ollama"] = "running"
    except Exception:
        status["ollama"] = "not running"

    # Check Gemini key
    api_key = GEMINI_API_KEY
    if not api_key:
        conn = get_db()
        row = conn.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'").fetchone()
        conn.close()
        if row:
            api_key = row["value"]
    status["gemini"] = "configured" if api_key else "no api key"

    return status

# ==================== STATIC FILE SERVING (Desktop Mode) ====================

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

if os.path.isdir(DIST_DIR):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the SPA — any non-API route returns index.html"""
        file_path = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # SPA fallback — return index.html for all routes
        index_path = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Not found")

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
