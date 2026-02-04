ATS_EXTRACTOR_SYSTEM_PROMPT = """
You are the IntelliHire IT ATS Extractor. 
Your SOLE purpose is to analyze Job Descriptions and Resumes for Information Technology and Software Engineering roles.

SCOPE:
- Software Development (Frontend, Backend, Mobile, Fullstack).
- Data Science, AI, and Machine Learning.
- DevOps, Cloud Architecture, and SRE.
- Cybersecurity and Network Security.
- Quality Assurance and Test Automation.

NON-IT ROLES:
If the input is not related to the above domains (e.g., Sales, Marketing, Nursing, Construction), you must reject it or return an error as per specific task rules.

STRICT RULES:
1. Extract technical capabilities using professional terminology (e.g., 'Container Orchestration' instead of 'Docker stuff').
2. Every skill extracted from a resume MUST have context/evidence.
3. Ignore generic soft skills (e.g., 'Team player', 'Hard worker') unless they are technical-adjacent (e.g., 'Agile Methodology').
4. Output professional, structured JSON only.
"""

JD_EXTRACTION_USER_PROMPT = """
TASK:
Analyze the Job Description for an IT or software-related role ONLY.

RULES:
- Assume the job is technical.
- Extract ALL technical requirements and responsibilities.
- Infer implicit technical skills from responsibilities.
- Separate REQUIRED vs PREFERRED skills.
- Output ONLY JSON.
- If the job is NOT IT-related, return {"error": "This resume analyzer supports IT roles only."}

JOB DESCRIPTION:
{jd_text}

OUTPUT:
{
  "job_title": "",
  "job_type": "software|data|ai|devops|qa|security|cloud",
  "required_skills": [],
  "preferred_skills": [],
  "responsibilities": [],
  "frameworks_and_tools": [],
  "databases": [],
  "cloud_platforms": [],
  "minimum_experience_years": null,
  "ats_keywords": []
}
"""

RESUME_EXTRACTION_USER_PROMPT = """
TASK:
Extract IT-related technical evidence from the resume.

RULES:
- Ignore non-IT content.
- Every skill must be backed by technical evidence.
- Link skills to projects, experience, or responsibilities.
- Identify tools, frameworks, and systems used.
- Categorize skills: language, framework, tool, database, cloud, concept.
- Output ONLY JSON.

RESUME:
{resume_text}

OUTPUT:
{
  "technical_skills_with_evidence": [
    {
      "skill": "",
      "category": "language|framework|tool|database|cloud|concept",
      "evidence_text": ""
    }
  ],
  "experience": [
    {
      "role": "",
      "technical_responsibilities": [],
      "tech_stack": [],
      "duration_years": null
    }
  ],
  "projects": [
    {
      "name": "",
      "technical_responsibilities": [],
      "tech_stack": []
    }
  ],
  "total_experience_years": null
}
"""

MATCHING_USER_PROMPT = """
TASK:
Map IT job requirements to technical resume evidence.

RULES:
- Match technical responsibilities (e.g., "Manage Kubernetes") to actual experience.
- Treat similar tech stacks as partial matches (e.g., React vs Vue).
- Focus on the depth of tool usage.
- If no technical evidence exists for a requirement, mark as "missing".
- Output ONLY JSON.

INPUT:
JOB_REQUIREMENTS:
{job_requirements}

RESUME_EVIDENCE:
{resume_evidence}

OUTPUT:
{
  "matches": [
    {
      "job_requirement": "",
      "match_status": "strong|partial|missing",
      "resume_evidence": "",
      "confidence": 0.0
    }
  ]
}
"""

EXPLANATION_USER_PROMPT = """
TASK:
Explain the IT resume match results from a technical perspective.

RULES:
- Highlight technical strengths (e.g., "Strong mastery of Python and AWS").
- Identify critical technical gaps (e.g., "Lacks experience with Docker and CI/CD").
- Provide an action plan focused on learning missing technologies or tools.
- Suggest technical interview questions based on the candidate's matched stack.

INPUT:
MATCH_SCORE_JSON:
{match_score_json}

OUTPUT:
{
  "summary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "action_plan": ["...", "..."],
  "interview_questions": ["...", "..."]
}
"""
