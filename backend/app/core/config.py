from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://admin:adminpassword@localhost:5432/inventory_db"
    FRONTEND_URL: str = "http://localhost:5173"
    LOW_STOCK_THRESHOLD: int = 10

    class Config:
        env_file = ".env"

settings = Settings()
