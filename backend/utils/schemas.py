from typing import List, Dict, Optional, Any
from pydantic import BaseModel

# --- 1. JD Analysis Parsing Schema ---
class MandatoryRequirements(BaseModel):
    skills: List[str] = []
    experience_years: Optional[int] = None
    education: List[str] = []
    tools_technologies: List[str] = []

class PreferredRequirements(BaseModel):
    skills: List[str] = []
    tools_technologies: List[str] = []

class ParsedJobDescription(BaseModel):
    job_title: str = ""
    job_type: str = "software" # software|data|ai|devops|qa|security|cloud
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    responsibilities: List[str] = []
    frameworks_and_tools: List[str] = []
    databases: List[str] = []
    cloud_platforms: List[str] = []
    minimum_experience_years: Optional[int] = None
    ats_keywords: List[str] = []
    soft_skills: List[str] = []
    domain_knowledge: List[str] = []
    
    # Backward compatibility properties
    @property
    def job_nature(self): return self.job_type
    @property
    def core_capabilities(self): return self.required_skills
    @property
    def required_tools_or_methods(self): return self.frameworks_and_tools + self.databases + self.cloud_platforms
    @property
    def preferred_tools_or_methods(self): return self.preferred_skills
    
    @property
    def mandatory_requirements(self):
        return MandatoryRequirements(
            skills=self.required_skills,
            tools_technologies=self.frameworks_and_tools,
            experience_years=self.minimum_experience_years
        )

# --- 2. Resume Decomposition Parsing Schema ---
class SkillWithEvidence(BaseModel):
    skill: str
    category: str = "concept" # language|framework|tool|database|cloud|concept
    context: str = "unknown" # experience|project|certification|skills_list
    evidence_text: str = ""

class ExperienceItem(BaseModel):
    role: str = ""
    technical_responsibilities: List[str] = []
    tech_stack: List[str] = []
    duration_years: Optional[float] = None
    
    # Backward compatibility
    @property
    def responsibilities(self): return self.technical_responsibilities
    @property
    def tools_used(self): return self.tech_stack

class ProjectItem(BaseModel):
    name: str = ""
    technical_responsibilities: List[str] = []
    tech_stack: List[str] = []

class ParsedResume(BaseModel):
    technical_skills_with_evidence: List[SkillWithEvidence] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    total_experience_years: Optional[float] = None
    
    roles_held: List[str] = []
    tools_and_methods_used: List[str] = []
    domains_worked_in: List[str] = []
    raw_text: str = "" 
    
    # Backward compatibility properties
    @property
    def capabilities_with_evidence(self): return self.technical_skills_with_evidence
    @property
    def skills_with_evidence(self): return self.technical_skills_with_evidence
    @property
    def experience_years(self): return self.total_experience_years
    @property
    def education(self): return []
    @property
    def certifications(self): return []

# --- 3. Match Result Schema ---
class MatchReportItem(BaseModel):
    job_requirement: str
    match_status: str # strong | partial | missing
    resume_evidence: Optional[str] = None
    confidence: float = 0.0
    category: str = "capability" # For internal scoring categorization
    score_impact: float = 0.0

class SkillGapAnalysis(BaseModel):
    skill: str
    severity: str = "high" # high (missing) | medium (partial)
    reason: str
    how_to_improve: str

class MatchScore(BaseModel):
    overall_score: int
    breakdown: Dict[str, float]
    missing_critical_skills: List[str] = []
    missing_skills: List[str] = [] # Legacy field for UI
    matched_skills: List[str] = []
    detailed_match_report: List[MatchReportItem] = []
    skill_gap_analysis: List[SkillGapAnalysis] = []
    skill_match_percent: str = "0%"
    
    # UI Metadata
    detected_years_experience: float = 0.0
    required_years_experience: int = 0
