from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from models import User
from database import get_session

# Şifreleme için bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Şifre hash'leme
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Şifre doğrulama
def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# Token oluştur
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token'dan kullanıcıyı çöz
def get_current_user(token: str) -> Optional[User]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None

        session = get_session()
        user = session.exec(select(User).where(User.email == email)).first()
        return user
    except JWTError:
        return None
