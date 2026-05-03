from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from enum import Enum

class OutputFormat(str, Enum):
    MARKDOWN = "markdown"
    HTML = "html"
    PLAIN_TEXT = "plain_text"

class TaskRequest(BaseModel):
    prompt: str = Field(..., description="Raw user input/topic")
    format: OutputFormat = Field(default=OutputFormat.MARKDOWN)

class StructuredTask(BaseModel):
    topic: str
    tone: str
    audience: str
    format: str
    word_count: int
    keywords: List[str]
    angle: str = Field(..., description="The unique perspective or hook for the content")

class ContentSection(BaseModel):
    title: str
    description: str
    estimated_word_count: int

class ContentOutline(BaseModel):
    title: str
    sections: List[ContentSection]

class DraftSection(BaseModel):
    title: str
    content: str

class ContentDraft(BaseModel):
    sections: List[DraftSection]
    full_text: str

class FeedbackItem(BaseModel):
    section_title: str
    issue: str
    suggestion: str
    severity: str = Field(..., description="Low, Medium, or High")

class FeedbackReport(BaseModel):
    is_satisfactory: bool
    feedback_items: List[FeedbackItem]
    general_comments: Optional[str] = None

class FinalOutput(BaseModel):
    content: str
    format: OutputFormat
    metadata: Dict[str, str]

class AgentStage(str, Enum):
    PARSER = "parser"
    PLANNER = "planner"
    WRITER = "writer"
    CRITIC = "critic"
    OPTIMIZER = "optimizer"
    FORMATTER = "formatter"
    EVALUATOR = "evaluator"
    COMPLETED = "completed"
    FAILED = "failed"

class LogEntry(BaseModel):
    timestamp: str
    agent: str
    message: str
    level: str = "INFO"

class SharedState(BaseModel):
    task_id: str
    original_request: TaskRequest
    structured_task: Optional[StructuredTask] = None
    outline: Optional[ContentOutline] = None
    draft: Optional[ContentDraft] = None
    feedback: Optional[FeedbackReport] = None
    final_output: Optional[FinalOutput] = None
    evaluation_results: Optional[Dict[str, float]] = None
    current_stage: AgentStage = AgentStage.PARSER
    logs: List[LogEntry] = []
    errors: List[str] = []
