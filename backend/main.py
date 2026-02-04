from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.parser import extract_text
from utils.extractor import extract_sections
from utils.scorer import calculate_score
from utils.ai_insights import generate_ai_insights

# New Advanced Engine Imports
from utils.extraction_engine import mock_ai_parse_jd, mock_ai_parse_resume, ExplanationAgent
from utils.advanced_scorer import advanced_match

import json
from typing import Optional

app = FastAPI(title="Matchly AI Resume Parser")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB

async def validate_pdf(file: UploadFile):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail=f"File {file.filename} must be a PDF.")
    
    # Check Magic Number (Header)
    header = await file.read(4)
    await file.seek(0) # Reset cursor
    if header != b'%PDF':
         raise HTTPException(status_code=400, detail=f"File {file.filename} does not appear to be a valid PDF.")
         
    # Check Size (Approximate via content-length header if available, else read check)
    # Note: UploadFile might be spooled. 
    # For strict checking:
    content = await file.read()
    await file.seek(0)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds maximum size of 5MB.")

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description_file: Optional[UploadFile] = File(None),
    job_description_text: Optional[str] = Form(None)
):
    try:
        # Security: Validate Resume
        await validate_pdf(resume)
        
        # 1. Parse Resume
        resume_content = await resume.read()
        resume_text = extract_text(resume_content, resume.filename)
        if not resume_text:
             raise HTTPException(status_code=400, detail="Could not extract text from Resume PDF.")

        # 2. Get Job Description Text
        jd_text = ""
        jd_source = ""
        
        if job_description_file:
            # Security: Validate JD File
            await validate_pdf(job_description_file)
            
            jd_content = await job_description_file.read()
            jd_text = extract_text(jd_content, job_description_file.filename)
            jd_source = job_description_file.filename
            
            if not jd_text:
                 raise HTTPException(status_code=400, detail="Could not extract text from Job Description PDF.")
                 
        elif job_description_text:
            if len(job_description_text) > 100_000: # 100k char limit for text
                raise HTTPException(status_code=400, detail="Job Description text too long.")
            jd_text = job_description_text
            jd_source = "Text Input"
        else:
            raise HTTPException(status_code=400, detail="Please provide either a Job Description file (PDF) or text.")

        # 3. Extract Sections from Resume (Legacy / Display)
        sections = extract_sections(resume_text)
        
        # --- AGENTIC WORKFLOW START ---
        # 1. Agent 1: JD Analyzer
        parsed_jd = mock_ai_parse_jd(jd_text)
        
        # 2. Agent 2: Resume Evidence
        parsed_resume = mock_ai_parse_resume(resume_text)
        
        # 3. Agent 3: Matching & Scoring (Hybrid)
        # Using semantic embeddings and determinstic rules
        advanced_result = advanced_match(parsed_resume, parsed_jd)
        
        # 4. Agent 5: Explanation
        explanation_agent = ExplanationAgent()
        agent_insights = explanation_agent.run(advanced_result)
        
        # --- RESPONSE COMPOSITION ---
        
        # Map advanced result to legacy schema for frontend compatibility where needed
        legacy_result = {
            "overall_score": advanced_result.overall_score,
            "breakdown": advanced_result.breakdown,
            "matched_skills": advanced_result.matched_skills,
            "missing_skills": advanced_result.missing_critical_skills,
            "skill_gap_analysis": advanced_result.skill_gap_analysis # Pass through new analysis
        }
        
        return {
            "filename": resume.filename,
            "jd_source": jd_source,
            "analysis": legacy_result,
            "ai_insights": agent_insights, # Use the Agent's structured output
            "sections": sections,
            "debug_advanced": advanced_result.dict() # For inspection
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error processing files: {e}") # Log full validation/internal error
        # Security: Do not expose stack trace or raw system errors to client
        raise HTTPException(status_code=500, detail="Internal Server Error: processing failed.")
