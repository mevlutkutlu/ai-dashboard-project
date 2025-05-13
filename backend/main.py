from fastapi import FastAPI, Request as FastAPIRequest, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select
import openai
import json
import os

from config import OPENAI_API_KEY
from database import create_db_and_tables, get_session
from models import User, History
from auth import hash_password, verify_password, create_access_token, get_current_user


openai.api_key = OPENAI_API_KEY

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB tablolarını oluştur
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# templates.json oku
def load_templates():
    path = os.path.join(os.path.dirname(__file__), "templates.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# Template bilgisi döndür
@app.get("/api/templates/{template_id}")
def get_template(template_id: str):
    templates = load_templates()
    template = templates.get(template_id)
    if not template:
        return {"error": "Template not found"}
    return template

# Dynamic input model
class DynamicInput(BaseModel):
    template_id: str
    fields: dict

@app.post("/generate")
def generate_output(
    req: DynamicInput,
    authorization: str = Header(...),
):
    user = get_current_user(authorization.split(" ")[1])
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz token")

    templates = load_templates()
    template = templates.get(req.template_id)
    if not template:
        return {"error": "Template not found"}

    prompt_template = template["prompt_template"]
    try:
        prompt = prompt_template.format(**req.fields)
    except KeyError as e:
        return {"error": f"Eksik alan: {e}"}

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        result = response["choices"][0]["message"]["content"]

        # ✨ History kaydı
        session = get_session()
        history = History(
            user_id=user.id,
            template_id=req.template_id,
            input_fields=json.dumps(req.fields, ensure_ascii=False),
            output_text=result
        )
        session.add(history)
        session.commit()

        return {"result": result}
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/history")
def get_history(authorization: str = Header(...)):
    user = get_current_user(authorization.split(" ")[1])
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz token")

    session = get_session()
    records = session.exec(
        select(History).where(History.user_id == user.id).order_by(History.created_at.desc())
    ).all()

    return [
        {
            "template_id": h.template_id,
            "input_fields": json.loads(h.input_fields),
            "output_text": h.output_text,
            "created_at": h.created_at.isoformat()
        }
        for h in records
    ]


# ------------------ AUTH START ------------------

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(data: RegisterRequest):
    session: Session = get_session()
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")

    hashed_pw = hash_password(data.password)
    user = User(email=data.email, password_hash=hashed_pw)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "Kayıt başarılı", "user_id": user.id}

@app.post("/login")
def login(data: LoginRequest):
    session: Session = get_session()
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre.")

    token = create_access_token({"sub": user.email})
    return {"access_token": token}

@app.get("/me")
def me(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token formatı hatalı")

    token = authorization.split(" ")[1]
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz token")

    return {"email": user.email, "role": user.role, "id": user.id}

# ------------------ AUTH END ------------------
