from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/inventory"
    APP_NAME: str = "Inventory & Order Management System"

    class Config:
        env_file = ".env"

settings = Settings()
