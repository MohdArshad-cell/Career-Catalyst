"""Career Roadmap Generation Service."""
from app.services.llm_client import call_llm, parse_ai_json, load_prompt
from pydantic import BaseModel
from typing import List

class Competency(BaseModel):
    skill: str
    current_level: str
    required_level: str
    gap_analysis: str

class Milestone(BaseModel):
    timeframe: str
    focus: str
    action_items: List[str]
    success_kpis: List[str]

class Resource(BaseModel):
    title: str
    type: str
    reason: str

class RoadmapResponse(BaseModel):
    current_assessment: str
    competency_matrix: List[Competency]
    milestones: List[Milestone]
    recommended_resources: List[Resource]

def execute_roadmap_chain(resume_text: str, target_goal: str, timeframe: str = "12 Months") -> dict:
    if not resume_text.strip() or not target_goal.strip():
        raise ValueError("Both resume and target goal are required.")
    
    # Truncate content to avoid exceeding context limits for large PDFs
    truncated_resume = resume_text[:15000]
    
    prompt_template = load_prompt("career_roadmap", "prompt_roadmap.txt")
    prompt = prompt_template \
        .replace('{resume_text}', truncated_resume) \
        .replace('{target_goal}', target_goal) \
        .replace('{timeframe}', timeframe)
    
    raw_json = call_llm(prompt, force_json=True)
    parsed_data = parse_ai_json(raw_json)
    
    # Validate output perfectly matches our schema
    validated_data = RoadmapResponse(**parsed_data)
    return validated_data.model_dump()
