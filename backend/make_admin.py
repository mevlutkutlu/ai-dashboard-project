from sqlmodel import Session, select
from database import engine
from models import User

email = "admin@deneme.com"

with Session(engine) as session:
    user = session.exec(select(User).where(User.email == email)).first()
    if user:
        user.role = "admin"
        session.add(user)
        session.commit()
        print(f"{email} artık admin oldu!")
    else:
        print("Kullanıcı bulunamadı.")
