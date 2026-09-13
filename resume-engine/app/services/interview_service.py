"""
Interview Prep Service — Career Catalyst Resume Engine.
Generates tailored interview questions with model answers in a single LLM call.
"""
from app.services.llm_client import call_llm, parse_ai_json, load_prompt
from pydantic import BaseModel
from typing import List

class InterviewAnalysis(BaseModel):
    core_objective: str
    top_hard_skills: List[str]
    top_soft_skills: List[str]

class InterviewQuestion(BaseModel):
    category: str
    question: str
    answer: str
    follow_up: str

class InterviewResponse(BaseModel):
    analysis: InterviewAnalysis
    questions: List[InterviewQuestion]

# ==========================================
# CORE EXECUTION CHAIN
# ==========================================
def execute_interview_chain(job_description: str, resume_text: str = "", interview_round: str = "Technical Deep Dive") -> dict:
    """
    Executes a single-pass AI chain to analyze a JD + Resume and generate
    10 rigorous interview questions with model answers and follow-ups.
    """
    if not job_description or not job_description.strip():
        raise ValueError("Job description is empty.")

    try:
        print("--- 🧠 Interview Prep: Analysis + Generation ---")

        prompt_template = load_prompt("interview_prep", "prompt_interview.txt")
        prompt = prompt_template \
            .replace('{job_description}', job_description) \
            .replace('{resume_text}', resume_text if resume_text else "None provided") \
            .replace('{interview_round}', interview_round)

        raw_json = call_llm(prompt, force_json=True)
        result = parse_ai_json(raw_json)
        
        # Validate schema
        validated_data = InterviewResponse(**result)

        print("--- ✅ Interview Prep Generation Successful ---")
        return validated_data.model_dump()

    except Exception as e:
        print(f"❌ Interview Prep Chain Error: {e}")
        raise RuntimeError(f"Interview Generation Chain Failed: {str(e)}") from e