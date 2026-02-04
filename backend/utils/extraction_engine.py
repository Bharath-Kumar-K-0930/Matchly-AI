from .schemas import ParsedResume, ParsedJobDescription, MandatoryRequirements, PreferredRequirements, SkillWithEvidence, ExperienceItem, MatchScore
from .prompts import ATS_EXTRACTOR_SYSTEM_PROMPT, JD_EXTRACTION_USER_PROMPT, RESUME_EXTRACTION_USER_PROMPT, EXPLANATION_USER_PROMPT
import re
from .normalizer import normalize_skill, get_skill_category
from .it_taxonomy_data import IT_TAXONOMY

# ==========================================
# 🧩 AGENT 1: IT JD ANALYZER AGENT
# ==========================================
class JDAgent:
    """
    Role: IT-Specific JD Extraction Agent.
    """
    def run(self, jd_text: str) -> ParsedJobDescription:
        jd_lower = jd_text.lower()
        
        # IT-Specific Domain Scoring
        domain_scores = {
            "software": 0, "data": 0, "ai": 0, "devops": 0, "cloud": 0, "qa": 0, "security": 0
        }
        
        # Scoring logic
        keywords = {
            "software": ["react", "frontend", "backend", "fullstack", "javascript", "typescript", "python", "java", "golang", "node", "api", "microservice", "web", "coding", "software", "developer"],
            "data": ["data", "sql", "spark", "hadoop", "etl", "bi", "warehouse", "analytics", "dashboard", "database", "pipeline"],
            "ai": ["scientist", "machine learning", "ml", "nlp", "tensorflow", "pytorch", "ai", "artificial intelligence", "model", "train", "vision", "deep learning"],
            "devops": ["devops", "kubernetes", "docker", "terraform", "ansible", "jenkins", "cicd", "ci/cd", "pipeline", "orchestration", "k8s"],
            "cloud": ["aws", "azure", "gcp", "cloud", "infrastructure", "server", "linux", "network", "ec2", "s3", "lambda", "sre"],
            "qa": ["qa", "tester", "automation", "selenium", "cypress", "testing", "quality", "unit test", "manual test"],
            "security": ["cyber", "security", "pentest", "soc", "firewall", "encryption", "vulnerability", "compliance", "threat", "vulnerabilities", "audit"]
        }
        
        for domain, keys in keywords.items():
            for k in keys:
                # Substring match for technical roots
                if k in ["model", "test", "develop", "deploy", "analyt", "vulnerab", "automat"]:
                    if k in jd_lower:
                        domain_scores[domain] += 1
                else:
                    pattern = r'\b' + re.escape(k) + r'\b'
                    if k in ["ci/cd", "c++", "c#", "ui", "qa"]:
                        if k in jd_lower: domain_scores[domain] += 1
                    elif re.search(pattern, jd_lower):
                        domain_scores[domain] += 1
        
        # IT-Specific Keyword Guard (Secondary check)
        IT_MARKERS = [
            "software", "develop", "engineer", "tech", "stack", "programming", "code", "it ", 
            "qa", "testing", "security", "cyber", "devops", "sre", "cloud", "data", "analyst", "architect"
        ]
        
        has_it_markers = any(m in jd_lower for m in IT_MARKERS)
        max_score = max(domain_scores.values())
        
        if max_score == 0 and not has_it_markers:
            return ParsedJobDescription(job_title="NON-IT ROLE REJECTED", job_type="unknown")
            
        # Tie-breaker or default
        jtype = max(domain_scores, key=domain_scores.get)
        if domain_scores[jtype] == 0:
            jtype = "software"
            
        # Precise IT Capability Mapping (Refined to be less greedy)
        capability_mappings = [
            (r"(build|develop|create|integrate|implement)\s+([a-z0-9\+\#\-\s]{2,20})\s+api", "API Development"),
            (r"(optimize|manage|integrate|scale)\s+([a-z0-9\+\#\-\s]{2,20})\s+sql", "Database Management"),
            (r"(deploy|architect|manage|orchestrate)\s+([a-z0-9\+\#\-\s]{2,20})\s+on\s+(aws|azure|gcp|cloud)", "Cloud Architecture"),
            (r"(train|build|optimize)\s+([a-z0-9\+\#\-\s]{2,20})\s+model", "ML Engineering"),
            (r"(automate|design|execute|write)\s+([a-z0-9\+\#\-\s]{2,20})\s+tests?", "Test Automation"),
            # Generic Software Dev (stricter)
            (r"(develop|architect|engineer|build)\s+([a-z0-9\+\#\-\s]{3,25})\s+(system|application|app|service|tool)", " Systems Engineering")
        ]
        
        extracted_capabilities = []
        for pattern, mapping in capability_mappings:
            matches = re.finditer(pattern, jd_lower)
            for match in matches:
                if mapping.startswith(" "): # Dynamic part
                    obj = match.group(2).strip()
                    if obj and len(obj.split()) <= 3: # Shorter objects
                        extracted_capabilities.append(f"{obj.title()}{mapping}")
                else:
                    extracted_capabilities.append(mapping)
        
        # IT Taxonomy Extraction
        found_techs = {cat: [] for cat in IT_TAXONOMY}
        for category, skills in IT_TAXONOMY.items():
            for skill in skills:
                # Special handling for symbols (C++, C#, .NET) where \b fails
                if any(c in skill for c in ['+', '#', '.']):
                    # Check if skill exists and is surrounded by compatible delimiters
                    # Delimiters: start/end, whitespace, punctuation, brackets
                    pattern = r'(?:^|[\s\.,;:\(\)\[\]\-/])' + re.escape(skill) + r'(?:$|[\s\.,;:\(\)\[\]\-/])'
                    if re.search(pattern, jd_lower): 
                         found_techs[category].append(normalize_skill(skill))
                else:
                    # Use word boundaries for standard words
                    if re.search(r'\b' + re.escape(skill) + r'\b', jd_lower):
                        found_techs[category].append(normalize_skill(skill))

        all_normalized_techs = [normalize_skill(t) for sub in found_techs.values() for t in sub]
        
        # Consolidate categories for the schema
        frameworks_tools = (
            found_techs.get("frontend", []) + 
            found_techs.get("backend", []) + 
            found_techs.get("devops", []) + 
            found_techs.get("testing", []) +
            found_techs.get("collaboration", [])
        )
        
        # Experience extraction
        exp_match = re.search(r'(\d+)\+?\s*years?', jd_lower)
        min_years = int(exp_match.group(1)) if exp_match else 2

        return ParsedJobDescription(
            job_title="Assessed IT Role", 
            job_type=jtype,
            required_skills=list(set(all_normalized_techs + extracted_capabilities)),
            preferred_skills=[],
            responsibilities=["Technical contribution in identified tech stack"],
            frameworks_and_tools=list(set(frameworks_tools)),
            databases=list(set(found_techs.get("databases", []))),
            cloud_platforms=list(set(found_techs.get("cloud", []))),
            minimum_experience_years=min_years,
            ats_keywords=list(set(all_normalized_techs))
        )

# ==========================================
# 🧩 AGENT 2: IT RESUME EVIDENCE AGENT
# ==========================================
class ResumeAgent:
    """
    Role: IT-Specific Resume Evidence Agent.
    """
    def run(self, resume_text: str) -> ParsedResume:
        resume_lower = resume_text.lower()
        skills_evidence = []
        
        # Technical Action Patterns (Refined)
        capability_mappings = [
            (r"(built|developed|created|integrated|implemented)\s+([a-z0-9\+\#\-\s]{2,20})\s+api", "API Development"),
            (r"(optimized|managed|integrated|scaled)\s+([a-z0-9\+\#\-\s]{2,20})\s+sql", "Database Management"),
            (r"(deployed|architected|managed|orchestrated)\s+([a-z0-9\+\#\-\s]{2,20})\s+on\s+(aws|azure|gcp|cloud)", "Cloud Architecture"),
            (r"(trained|built|optimized)\s+([a-z0-9\+\#\-\s]{2,20})\s+model", "ML Engineering"),
            (r"(automated|designed|executed|wrote)\s+([a-z0-9\+\#\-\s]{2,20})\s+tests?", "Test Automation"),
            (r"(built|developed|created|architected|implemented|integrated)\s+([a-z0-9\+\#\-\s]{3,25})\s+(system|application|app|service|tool)", " Systems Engineering")
        ]
        
        # Extract Capability-based evidence
        for pattern, mapping in capability_mappings:
            matches = re.finditer(pattern, resume_lower)
            for match in matches:
                idx = match.start()
                snippet = resume_text[max(0, idx-10):min(len(resume_text), idx+70)].replace('\n', ' ')
                
                if mapping.startswith(" "):
                    skill_name = f"{match.group(2).title().strip()}{mapping}"
                else:
                    skill_name = mapping
                
                skills_evidence.append(SkillWithEvidence(
                    skill=skill_name,
                    category="concept",
                    context="experience",
                    evidence_text=f"...{snippet}..."
                ))
        
        # IT Taxonomy Extraction (Canonical Skills)
        all_it_techs = []
        for category, skills in IT_TAXONOMY.items():
            for skill in skills:
                # Special handling for symbols (C++, C#, .NET)
                found = False
                if any(c in skill for c in ['+', '#', '.']):
                     pattern = r'(?:^|[\s\.,;:\(\)\[\]\-/])' + re.escape(skill) + r'(?:$|[\s\.,;:\(\)\[\]\-/])'
                     if re.search(pattern, resume_lower):
                         found = True
                else:
                    if re.search(r'\b' + re.escape(skill) + r'\b', resume_lower):
                        found = True
                
                if found:
                    normalized = normalize_skill(skill)
                    idx = resume_lower.find(skill) # Simple find for context snippet
                    snippet = resume_text[max(0, idx-20):min(len(resume_text), idx+60)].replace('\n', ' ')
                    skills_evidence.append(SkillWithEvidence(
                        skill=normalized,
                        category=category,
                        context="skills_list",
                        evidence_text=f"...{snippet}..."
                    ))
                    all_it_techs.append(normalized)
                
        # Experience Year Calculation
        years_found = re.findall(r'(\d+)\+?\s*years?', resume_lower)
        valid_years = [int(y) for y in years_found if int(y) < 35] # Filter out "2020 years" typos
        total_years = max(valid_years) if valid_years else 0.0

        return ParsedResume(
            technical_skills_with_evidence=skills_evidence,
            experience=[ExperienceItem(
                role="Software/IT Experience", 
                technical_responsibilities=[s.skill for s in skills_evidence if s.context == "experience"][:5],
                tech_stack=list(set(all_it_techs))
            )], 
            total_experience_years=float(total_years),
            tools_and_methods_used=list(set(all_it_techs)),
            raw_text=resume_text
        )

# ==========================================
# 🧩 AGENT 5: EXPLANATION AGENT (IT Focus)
# ==========================================
class ExplanationAgent:
    """
    Role: Analyze scoring data to generate nuanced technical insights.
    """
    def run(self, match_score: MatchScore):
        score = match_score.overall_score
        report = match_score.detailed_match_report
        
        # Technical Match Analysis
        tech_matches = [item for item in report if item.match_status == "strong"]
        
        strengths = []
        weaknesses = []
        
        if len(tech_matches) > 3:
            strengths.append("Broad mastery of the required technical stack.")
        elif len(tech_matches) > 0:
            strengths.append("Solid foundation in core technologies.")
        else:
            weaknesses.append("Significant gaps in critical tool/framework requirements.")
            
        # Summary Generation
        if score > 80:
            summary = "Excellent IT match. Candidate demonstrates strong technical architectural depth and stack alignment."
        elif score > 60:
            summary = "Qualified Candidate. Good technical foundation, though some specific tool mastery is missing."
        elif score > 40:
            summary = "Technical Potential. Key skills are present but lacking depth or evidence in specific required frameworks."
        else:
            summary = "Low Technical Alignment. Candidate's stack does not currently match the core requirements for this role."

        return {
            "summary": summary,
            "strengths": strengths + match_score.matched_skills[:2],
            "weaknesses": weaknesses + match_score.missing_critical_skills[:2],
            "action_plan": [gap.how_to_improve for gap in match_score.skill_gap_analysis[:3]],
            "interview_questions": [f"You mentioned {s}. Can you describe a complex technical challenge you solved using it?" for s in match_score.matched_skills[:2]]
        }

def mock_ai_parse_jd(text): return JDAgent().run(text)
def mock_ai_parse_resume(text): return ResumeAgent().run(text)
