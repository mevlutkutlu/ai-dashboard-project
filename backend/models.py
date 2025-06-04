from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str = "user"

class History(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    template_id: str
    input_fields: str  # JSON string olarak saklanır
    output_text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Template(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    identifier: str  # örnek: "blog_post_generator"
    inputs: str  # JSON olarak string içinde tutulacak
    prompt_template: str

