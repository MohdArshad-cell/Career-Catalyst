"""LinkedIn Profile Optimization Service."""
from app.services.llm_client import call_llm, parse_ai_json, load_prompt
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

class NetworkingStrategy(BaseModel):
    networking_targets: List[str]
    connection_script: str

class LinkedInResponse(BaseModel):
    trajectory_analysis: TrajectoryAnalysis
    headline: str
    about_section: str
    experience_bullets: List[ExperienceBullet]
    project_bullets: List[ProjectBullet]
    top_skills: List[str]
    featured_section: List[str]
    creator_mode_hashtags: List[str]
    networking_strategy: NetworkingStrategy
    content_ideas: List[str]
    banner_prompt: str

def execute_linkedin_chain(linkedin_content: str, tone: str = "Professional", model: str = None, target_role: str = "") -> dict:
    if not linkedin_content.strip():
        raise ValueError("LinkedIn content is required.")
    
    # Truncate content to avoid exceeding context limits for large PDFs
    truncated_linkedin = linkedin_content[:15000]
    
    prompt_template = load_prompt("linkedin_optimizer", "prompt_linkedin.txt")
    prompt = prompt_template \
        .replace('{linkedin_content}', truncated_linkedin) \
        .replace('{tone}', tone) \
        .replace('{target_role}', target_role if target_role else "Infer best trajectory based on current experience")
    
    raw_json = call_llm(prompt, force_json=True, model=model)
    parsed_data = parse_ai_json(raw_json)
    
    # Validate output matches schema
    validated_data = LinkedInResponse(**parsed_data)
    return validated_data.model_dump()
