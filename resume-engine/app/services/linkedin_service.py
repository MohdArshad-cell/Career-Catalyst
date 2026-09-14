"""LinkedIn Profile Optimization Service."""
from app.services.llm_client import call_llm_structured, load_prompt
from pydantic import BaseModel
from typing import List

class ExperienceBullet(BaseModel):
    company: str
    bullets: List[str]

class ProjectBullet(BaseModel):
    project_name: str
    bullets: List[str]

class TrajectoryAnalysis(BaseModel):
    current_perception: str
    optimized_positioning: str

class LinkedInResponse(BaseModel):
    trajectory_analysis: TrajectoryAnalysis
    headline: str
    about_section: str
    experience_bullets: List[ExperienceBullet]
    project_bullets: List[ProjectBullet]
    content_ideas: List[str]
    networking_targets: List[str]
    banner_prompt: str

def execute_linkedin_chain(linkedin_content: str, tone: str = "Professional") -> dict:
    if not linkedin_content.strip():
        raise ValueError("LinkedIn content is required.")
    
    # Truncate content to avoid exceeding context limits for large PDFs
    truncated_linkedin = linkedin_content[:15000]
    
    prompt_template = load_prompt("linkedin_optimizer", "prompt_linkedin.txt")
    prompt = prompt_template \
        .replace('{linkedin_content}', truncated_linkedin) \
        .replace('{tone}', tone)
    
    raw_data = call_llm_structured(
        prompt,
        response_schema=LinkedInResponse,
        temperature=0.7,
        max_output_tokens=4096
    )
    
    # Validate output matches schema
    validated_data = LinkedInResponse(**raw_data)
    return validated_data.model_dump()
