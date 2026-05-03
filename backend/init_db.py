from app.db.session import engine
from app.db.models import Base
from loguru import logger

def init_db():
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.success("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.info("Ensure PostgreSQL is running and the database 'content_agent_db' exists.")

if __name__ == "__main__":
    init_db()
