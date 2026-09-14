import sys
import os

# Add resume-engine to sys.path
sys.path.append(os.path.abspath('.'))

from app.services.linkedin_service import execute_linkedin_chain
import traceback
import json

resume_content = """
Experience:
Software Engineer at Google
- Built high-performance microservices.

Projects:
FlashTix
- Engineered a ticketing platform.
"""

try:
    print("Executing chain...")
    result = execute_linkedin_chain(resume_content)
    print("SUCCESS!")
    print(json.dumps(result, indent=2))
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
