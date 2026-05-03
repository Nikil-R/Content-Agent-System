from sqlalchemy import Column, String, JSON, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.schemas.agent_schemas import AgentStage

Base = declarative_base()

class PipelineTask(Base):
    __tablename__ = "pipeline_tasks"

    task_id = Column(String, primary_key=True, index=True)
    original_prompt = Column(String, nullable=False)
    status = Column(SQLEnum(AgentStage), default=AgentStage.PARSER)
    full_state = Column(JSON, nullable=True)  # Stores the model_dump of SharedState
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    final_result = Column(String, nullable=True)
