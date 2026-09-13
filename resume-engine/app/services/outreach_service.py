"""Cold Outreach and Networking Service."""
from app.services.llm_client import call_llm, parse_ai_json, load_prompt
from pydantic import BaseModel
from typing import List

class SubjectLine(BaseModel):
    style: str
    text: str

class OutreachResponse(BaseModel):
    deliverability_score: int
    spam_analysis: str
    value_props: List[str]
    subject_lines: List[SubjectLine]
    cold_email: str
    linkedin_connection_note: str
    follow_up_email: str
    coffee_chat_script: str
    twitter_dm: str

def execute_outreach_chain(resume_text: str, job_description: str, tone: str = "Professional") -> dict:
    if not resume_text.strip() or not job_description.strip():
        raise ValueError("Both resume and target JD/Company are required.")
    
    # Truncate content to avoid exceeding context limits for large PDFs
    truncated_resume = resume_text[:15000]
    
    prompt_template = load_prompt("cold_outreach", "prompt_outreach.txt")
    prompt = prompt_template \
        .replace('{resume_text}', truncated_resume) \
        .replace('{job_description}', job_description) \
        .replace('{tone}', tone)
    
    raw_json = call_llm(prompt, force_json=True)
    parsed_data = parse_ai_json(raw_json)
    
    # Validate output matches schema
    validated_data = OutreachResponse(**parsed_data)
    return validated_data.model_dump()
