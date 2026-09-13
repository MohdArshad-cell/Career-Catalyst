"""
ATS X-Ray Service — Career Catalyst Resume Engine.
Performs AI-driven evaluation of a resume's health without requiring a specific job description.
"""
import json
import hashlib
import time
from typing import List

from pydantic import BaseModel, Field

from app.services.llm_client import call_llm_structured, load_prompt, get_redis_client

# ==========================================
# 1. AI DATA EXTRACTION SCHEMA
# ==========================================
class SuggestionDetail(BaseModel):
    weak_point: str = Field(..., description="Copy EXACTLY 1 raw bullet point from the resume that is weak. DO NOT include your thoughts, analysis, or commentary here. Just the exact original text.")
    critique: str = Field(..., description="Explain exactly why this bullet is weak (e.g., passive voice, lacks metrics, cliché).")
    rewrite_suggestion: str = Field(..., description="Provide a powerful, high-impact, metric-driven rewrite.")

class AtsXraySchema(BaseModel):
    overall_score: int = Field(..., description="Overall resume health score (0-100) based on impact, brevity, and action verbs.")
    executive_summary: str = Field(..., description="A brutal, 2-sentence executive summary of the resume's overall impression on a recruiter.")
    key_strengths: List[str] = Field(..., description="List of 3 things the resume does well.")
    red_flags: List[str] = Field(..., description="List of critical structural, metric, or language issues.")
    missing_critical_sections: List[str] = Field(..., description="List any standard resume sections that are missing or poorly placed (e.g., 'No Skills section', 'Education at the top for senior role').")
    suggestions: List[SuggestionDetail] = Field(..., description="List of 3 to 5 specific bullet point critiques and rewrites.")

# ==========================================
# 2. CORE EXECUTION CHAIN
# ==========================================
def _hash_eval(resume: str) -> str:
    return hashlib.sha256(resume[:1000].encode()).hexdigest()

def execute_ats_xray_chain(resume_text: str) -> dict:
    try:
        print("--- 🔎 ATS X-Ray: Checking Cache ---")
        eval_hash = _hash_eval(resume_text)
        redis_client = get_redis_client()
        
        if redis_client:
            cached = redis_client.get(f"ats_xray_cache:{eval_hash}")
            if cached:
                print("--- ⚡ ATS X-Ray: Cache Hit! Returning cached result ---")
                return json.loads(cached)

        print("--- 🧠 ATS X-Ray: Extracting Semantic Data ---")
        prompt_template = load_prompt("ats_xray", "prompt_ats_xray.txt")

        prompt = prompt_template.replace('{resume_text}', resume_text)

        # Single LLM call with structured output
        ai_data = call_llm_structured(
            prompt,
            response_schema=AtsXraySchema,
            temperature=0.2,
            max_output_tokens=4096,
        )

        # Return dict matching the Pydantic schema
        result = ai_data

        if redis_client:
            redis_client.setex(f"ats_xray_cache:{eval_hash}", 3600, json.dumps(result))
            
        return result

    except Exception as e:
        print(f"❌ ATS X-Ray Pipeline Halted: {e}")
        raise RuntimeError(f"Service Execution Failure: {str(e)}") from e
