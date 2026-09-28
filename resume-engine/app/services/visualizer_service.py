from pydantic import BaseModel
from app.services.llm_client import call_llm_structured, load_prompt

class ProjectVisualizerResponse(BaseModel):
    system_architecture_mermaid: str
    sequence_diagram_mermaid: str
    database_erd_mermaid: str
    tech_stack: list[str]
    eli5_explanation: str
    senior_dev_explanation: str
    architecture_roast: str
    enterprise_upgrade_suggestions: list[str]
    cloud_cost_estimate: str
    scaling_bottleneck_100k: str

def execute_visualizer_chain(project_description: str, model: str = None) -> dict:
    if not project_description.strip():
        raise ValueError("Project description is required.")
    
    # Truncate content to avoid exceeding context limits
    truncated_description = project_description[:15000]
    
    prompt_template = load_prompt("project_visualizer", "prompt_visualizer.txt")
    prompt = prompt_template.replace('{project_description}', truncated_description)
    
    # Use Structured Output to completely bypass raw JSON formatting errors
    parsed_data = call_llm_structured(prompt, response_schema=ProjectVisualizerResponse, model=model)
    
    # Clean up mermaid code if LLM included backticks
    mermaid_keys = ["system_architecture_mermaid", "sequence_diagram_mermaid", "database_erd_mermaid"]
    for key in mermaid_keys:
        if key in parsed_data:
            code = parsed_data[key]
            if code.startswith("```mermaid"):
                code = code[10:]
            elif code.startswith("```"):
                code = code[3:]
            if code.endswith("```"):
                code = code[:-3]
            parsed_data[key] = code.strip()
            
    return parsed_data
