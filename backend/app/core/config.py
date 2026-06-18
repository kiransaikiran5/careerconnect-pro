from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    password_reset_token_expire_minutes: int = 10  # for password reset link
    upload_dir: str = "uploads" 

    class Config:
        env_file = ".env"

settings = Settings()