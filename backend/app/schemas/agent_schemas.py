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
    platform: str = Field(..., description="e.g. YouTube, Instagram Reel, TikTok")
    target_duration: str = Field(..., description="e.g. 60 seconds, 10 minutes")
    tone: str
    audience: str
    visual_style: str = Field(..., description="e.g. Fast-paced cuts, Cinematic B-roll, Talking Head")
    keywords: List[str]
    angle: str = Field(..., description="The unique perspective or hook for the video")

class ScriptScene(BaseModel):
    scene_number: int
    scene_title: str
    visual_cue: str = Field(..., description="What the viewer sees (A-roll, B-roll, Text on screen)")
    estimated_duration_seconds: int

class ScriptOutline(BaseModel):
    title: str
    scenes: List[ScriptScene]

class DraftScene(BaseModel):
    scene_number: int
    visuals: str = Field(..., description="Visual instructions and B-roll notes")
    audio_dialogue: str = Field(..., description="The spoken script, voiceover, or sound effects")

class ContentDraft(BaseModel):
    scenes: List[DraftScene]
    full_text: Optional[str] = None

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
    AWAITING_APPROVAL = "awaiting_approval"
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
    outline: Optional[ScriptOutline] = None
    draft: Optional[ContentDraft] = None
    feedback: Optional[FeedbackReport] = None
    final_output: Optional[FinalOutput] = None
    evaluation_results: Optional[Dict[str, float]] = None
    current_stage: AgentStage = AgentStage.PARSER
    logs: List[LogEntry] = []
    errors: List[str] = []
