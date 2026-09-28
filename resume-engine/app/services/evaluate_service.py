"""
Evaluate Service — Career Catalyst Resume Engine.
Performs ATS scoring with deterministic math-based scoring (not LLM-scored).
"""
import json
import hashlib
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.services.llm_client import call_llm_structured, load_prompt, get_redis_client


# ==========================================
# 1. AI DATA EXTRACTION SCHEMA (NO SCORING)
# ==========================================
class RoastDetail(BaseModel):
    weak_bullet: str = Field(..., description="The exact weak, generic bullet point quoted from the resume.")
    critique: str = Field(..., description="Brutally honest reason why a recruiter would reject this.")
    rewrite: str = Field(..., description="A hard-hitting, metric-driven AI rewrite incorporating missing keywords.")

class SkillEvaluation(BaseModel):
    skill_name: str = Field(..., description="The exact noun-based skill extracted FROM THE JOB DESCRIPTION (e.g., 'Spring Boot', 'Redis'). NO VERBS.")
    is_found: bool = Field(..., description="True ONLY IF the skill OR a direct semantic equivalent (e.g., 'React' for 'React.js') is explicitly in the resume. False if missing.")

class DangerZone(BaseModel):
    question: str = Field(..., description="The hard interview question targeting the gap between JD and Resume.")
    reasoning: str = Field(..., description="Why this question is being asked.")

class TaskVsImpact(BaseModel):
    tasks_percentage: int = Field(..., description="Percentage of bullet points that are just tasks (0-100).")
    impact_percentage: int = Field(..., description="Percentage of bullet points that show measurable impact (0-100).")
    feedback: str = Field(..., description="Harsh feedback on the ratio.")

class SeniorityAlignment(BaseModel):
    jd_required_yoe: str = Field(..., description="Years of experience required by JD (e.g. '3-5 Years').")
    resume_yoe: str = Field(..., description="Years of experience inferred from resume (e.g. '1.5 Years').")
    alignment_feedback: str = Field(..., description="Brutally honest feedback comparing required vs actual seniority.")

class JdQualityCheck(BaseModel):
    is_generic: bool = Field(..., description="True if the JD is vague, extremely short, or lacks specific technical requirements.")
    missing_context: List[str] = Field(..., description="What the JD fails to specify (e.g. 'Missing tech stack', 'Missing exact YOE requirements').")
    strategy_suggestion: str = Field(..., description="Actionable strategy for applying to a vague JD (e.g. 'Focus on general problem solving and leadership').")

class AIResumeExtractionSchema(BaseModel):
    hard_skills_evaluation: List[SkillEvaluation] = Field(..., description="Evaluation of technical tools, frameworks, and hard skills REQUIRED BY THE JD.")
    soft_skills_evaluation: List[SkillEvaluation] = Field(..., description="Evaluation of methodologies (e.g., Agile) and soft skills REQUIRED BY THE JD.")
    red_flags: List[str] = Field(..., description="Critical dealbreakers.")
    constructive_roasts: List[RoastDetail] = Field(..., description="3 specific roasts targeting weak bullet points.")
    metrics_score: int = Field(..., description="Score out of 100 on how well the resume uses quantifiable metrics and data.")
    brevity_score: int = Field(..., description="Score out of 100 on brevity, conciseness, and readability.")
    action_verbs_score: int = Field(..., description="Score out of 100 on the use of strong, active verbs vs passive language.")
    keyword_context_warnings: List[str] = Field(..., description="Warnings for keywords listed in Skills but missing from Experience.")
    interview_danger_zones: List[DangerZone] = Field(..., description="Top 3 hard interview questions based on gaps.")
    task_vs_impact: TaskVsImpact = Field(..., description="Analysis of Task vs Impact ratio.")
    seniority_alignment: SeniorityAlignment = Field(..., description="Analysis of YOE and seniority.")
    jd_quality: JdQualityCheck = Field(..., description="Analysis of whether the Job Description is well-written or generic.")


# ==========================================
# 2. CORE EXECUTION CHAIN
# ==========================================
def _hash_eval(resume: str, jd: str) -> str:
    combined = f"{resume[:500]}||{jd[:500]}"
    return hashlib.sha256(combined.encode()).hexdigest()

def execute_evaluate_chain(resume_text: str, job_description: str, model: str = None) -> dict:
    try:
        print("--- 🧠 ATS Evaluator: Checking Cache ---")
        eval_hash = _hash_eval(resume_text, job_description)
        redis_client = get_redis_client()
        
        if redis_client:
            cached = redis_client.get(f"eval_cache:{eval_hash}")
            if cached:
                print("--- ⚡ ATS Evaluator: Cache Hit! Returning cached result ---")
                return json.loads(cached)

        print("--- 🧠 ATS Evaluator: Extracting Semantic Data ---")
        prompt_template = load_prompt("evaluate", "prompt_evaluate.txt")
        today_date = datetime.now().strftime("%B %Y")

        prompt = prompt_template.replace('{resume_text}', resume_text) \
                                .replace('{job_description}', job_description) \
                                .replace('{current_date}', today_date)

        # Single LLM call with structured output
        ai_data = call_llm_structured(
            prompt,
            response_schema=AIResumeExtractionSchema,
            temperature=0.0,
            max_output_tokens=4096,
            model=model,
        )

        hard_skills = ai_data.get("hard_skills_evaluation", [])
        soft_skills = ai_data.get("soft_skills_evaluation", [])

        # Extract Missing Keywords (Where is_found == False)
        missing_hard = [skill.get("skill_name", "Unknown") for skill in hard_skills if not skill.get("is_found", False)]
        missing_soft = [skill.get("skill_name", "Unknown") for skill in soft_skills if not skill.get("is_found", False)]

        # Calculate True Match Score Mathematically
        hard_total = len(hard_skills)
        soft_total = len(soft_skills)

        hard_score = ((hard_total - len(missing_hard)) / hard_total * 100) if hard_total > 0 else 100
        soft_score = ((soft_total - len(missing_soft)) / soft_total * 100) if soft_total > 0 else 100

        # Weighted calculation (75% Hard / 25% Soft)
        keyword_match_score = int(round((hard_score * 0.75) + (soft_score * 0.25)))

        # Extract other dimension scores
        metrics_score = ai_data.get("metrics_score", 50)
        brevity_score = ai_data.get("brevity_score", 50)
        action_verbs_score = ai_data.get("action_verbs_score", 50)

        # Final ATS Score Calculation (Weighted)
        # Keywords: 60%, Metrics: 15%, Brevity: 10%, Action Verbs: 15%
        final_score = int(round(
            (keyword_match_score * 0.60) +
            (metrics_score * 0.15) +
            (brevity_score * 0.10) +
            (action_verbs_score * 0.15)
        ))

        print(f"--- ✅ Evaluation Complete. Semantic ATS Score: {final_score}% ---")

        result = {
            "score": final_score,
            "dimension_scores": {
                "keyword_match": keyword_match_score,
                "metrics": metrics_score,
                "brevity": brevity_score,
                "action_verbs": action_verbs_score
            },
            "red_flags": ai_data.get("red_flags", []),
            "missing_keywords": missing_hard + missing_soft,
            "constructive_roasts": ai_data.get("constructive_roasts", []),
            "keyword_context_warnings": ai_data.get("keyword_context_warnings", []),
            "interview_danger_zones": ai_data.get("interview_danger_zones", []),
            "task_vs_impact": ai_data.get("task_vs_impact", {}),
            "seniority_alignment": ai_data.get("seniority_alignment", {}),
            "jd_quality": ai_data.get("jd_quality", {})
        }
        
        if redis_client:
            redis_client.setex(f"eval_cache:{eval_hash}", 3600, json.dumps(result))
            
        return result

    except Exception as e:
        print(f"❌ ATS Evaluation Pipeline Halted: {e}")
        raise RuntimeError(f"Service Execution Failure: {str(e)}") from e