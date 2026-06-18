from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PaymentOut(BaseModel):
    id: int
    subscription_id: Optional[int]
    amount: float
    payment_date: datetime
    transaction_id: str
    status: str

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    payment_id: int
    transaction_id: str
    amount: float
    payment_date: datetime
    plan_name: str
    company_name: Optional[str] = None
    recruiter_email: Optional[str] = None