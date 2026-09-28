from app.services.llm_client import call_llm, parse_ai_json, load_prompt

def execute_visualizer_chain(project_description: str, model: str = None) -> dict:
    if not project_description.strip():
        raise ValueError("Project description is required.")
    
    # Truncate content to avoid exceeding context limits
    truncated_description = project_description[:15000]
    
    prompt_template = load_prompt("project_visualizer", "prompt_visualizer.txt")
    prompt = prompt_template.replace('{project_description}', truncated_description)
    
    raw_json = call_llm(prompt, force_json=True, model=model)
    parsed_data = parse_ai_json(raw_json)
    
    # Clean up mermaid code if LLM included backticks
    if "mermaid_code" in parsed_data:
        code = parsed_data["mermaid_code"]
        if code.startswith("```mermaid"):
            code = code[10:]
        elif code.startswith("```"):
            code = code[3:]
        if code.endswith("```"):
            code = code[:-3]
        parsed_data["mermaid_code"] = code.strip()
        
    return parsed_data
