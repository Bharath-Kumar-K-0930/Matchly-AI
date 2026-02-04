import re
import math
from collections import Counter
from utils.normalizer import normalize_skill
from utils.it_taxonomy_data import IT_TAXONOMY

# Try importing semantic libraries
try:
    from sentence_transformers import SentenceTransformer, util
    model = SentenceTransformer('all-MiniLM-L6-v2') 
    SEMANTIC_AVAILABLE = True
except ImportError:
    model = None
    SEMANTIC_AVAILABLE = False
    print("Warning: sentence-transformers not found via import. Semantic features disabled.")
except Exception as e:
    model = None
    SEMANTIC_AVAILABLE = False
    print(f"Warning: Could not load SentenceTransformer: {e}")

COMMON_SKILLS_DB = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue", "node.js", 
    "fastapi", "flask", "django", "spring boot", "sql", "postgresql", "mysql", "mongodb", 
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "html", "css", 
    "sass", "tailwind", "rest api", "graphql", "machine learning", "nlp", "pandas", "numpy",
    "c++", "c#", ".net", "go", "rust", "terraform", "ansible", "jenkins", "linux", "agile",
    "scrum", "jira", "figma", "photoshop", "redis", "kafka", "elasticsearch"
]

def extract_skills_with_context(text):
    """
    Extracts skills and returns them with a frequency count.
    Future upgrade: Return location context (e.g. found in 'Experience' vs 'Skills' section).
    """
    text_lower = text.lower()
    found_skills = Counter()
    
    # Check against known DB
    for skill in COMMON_SKILLS_DB:
        # Regex for whole word match
        pattern = r'\b' + re.escape(skill) + r'\b'
        matches = re.findall(pattern, text_lower)
        if matches:
            found_skills[normalize_skill(skill)] += len(matches)
            
    return found_skills

def parse_job_description(jd_text):
    """
    Advanced JD Parsing:
    - Distinguish Required vs Preferred skills based on keywords.
    """
    jd_lower = jd_text.lower()
    
    # 1. Split into lines to identify context
    lines = jd_lower.split('\n')
    
    required_keywords = ["must have", "required", "mandatory", "essential", "qualifications"]
    preferred_keywords = ["good to have", "preferred", "plus", "bonus", "desirable"]
    
    required_skills = set()
    preferred_skills = set()
    
    # Context flag
    current_context = "neutral" # neutral, required, preferred
    
    for line in lines:
        # Heuristic context switching
        if any(k in line for k in required_keywords):
            current_context = "required"
        elif any(k in line for k in preferred_keywords):
            current_context = "preferred"
            
        # Extract skills from line
        line_skills = extract_skills_with_context(line)
        
        for skill in line_skills:
            if current_context == "preferred":
                preferred_skills.add(skill)
            else:
                # Default to required if found in "neutral" or explicit "required"
                # But allow promoting neutral to preferred if we find better signal later? 
                # For MVP, assume neutral context -> required (usually the bulk of JD)
                required_skills.add(skill)
                
    return {
        "required_skills": list(required_skills),
        "preferred_skills": list(preferred_skills),
        "all_skills_flat": list(required_skills.union(preferred_skills))
    }

def calculate_semantic_similarity(text1, text2):
    if not SEMANTIC_AVAILABLE or not model:
        return 0.5 
    
    # Truncate for speed
    e1 = model.encode(text1[:1000], convert_to_tensor=True)
    e2 = model.encode(text2[:1000], convert_to_tensor=True)
    return float(util.cos_sim(e1, e2)[0][0])

def semantic_match(jd_items, resume_items, threshold=0.65):
    """
    Performs semantic matching between a list of JD requirements and Resume items.
    Returns a structured list of match results with status and confidence.
    """
    if not SEMANTIC_AVAILABLE or not model:
        # Fallback for when model is not loaded
        return [{
            "jd_requirement": item,
            "best_match": None,
            "confidence": 0.0,
            "status": "missing"
        } for item in jd_items]
        
    if not jd_items or not resume_items:
         return [{
            "jd_requirement": item,
            "best_match": None,
            "confidence": 0.0,
            "status": "missing"
        } for item in jd_items]

    # Normalize resume items for better semantic alignment
    normalized_resume_items = [normalize_skill(r) for r in resume_items]

    # Batch encode
    jd_embeddings = model.encode(jd_items, convert_to_tensor=True)
    resume_embeddings = model.encode(normalized_resume_items, convert_to_tensor=True)

    results = []
    
    for i, jd_item in enumerate(jd_items):
        best_final_score = -1.0 # Allow negatives if embeddings are weird, but usually 0-1
        best_match_text = None
        
        norm_jd = normalize_skill(jd_item)

        # Iterate all resume items to find true best match after boost
        for j, resume_item in enumerate(normalized_resume_items):
            # Calculate raw similarity
            raw_score = float(util.cos_sim(jd_embeddings[i], resume_embeddings[j])[0][0])
             
            norm_resume = normalize_skill(resume_item)
             
            current_score = raw_score
            
            # 1. Exact Normal Match
            if norm_jd == norm_resume:
                current_score = 1.0
            else:
                # 2. Category Cluster Boost
                for cat, skills in IT_TAXONOMY.items():
                    if norm_jd in skills and norm_resume in skills:
                        boost_factor = 1.0
                        min_floor = 0.0
                        
                        # Foundational tech gets higher boost
                        if cat == "languages":
                            boost_factor = 1.2
                            min_floor = 0.0 # Languages are distinct. C# != Java.
                        elif cat == "databases":
                            boost_factor = 1.3
                            min_floor = 0.5 # Some overlap
                            if norm_jd == "sql" or norm_resume == "sql": 
                                boost_factor = 1.8 
                                min_floor = 0.85 # SQL is universal
                        elif cat in ["cloud", "devops", "security", "testing"]:
                            boost_factor = 1.5
                            min_floor = 0.70 # Tools are often swappable (AWS vs Azure)
                        elif cat in ["frontend", "backend", "data_ai"]:
                            boost_factor = 1.4
                            min_floor = 0.65 # Frameworks (React vs Vue) have shared concepts
                        else:
                            boost_factor = 1.1 
                            min_floor = 0.0
                        
                        # Apply Boost AND Floor
                        current_score = max(current_score * boost_factor, min_floor)
                        current_score = min(1.0, current_score)
                        break
            
            if current_score > best_final_score:
                best_final_score = current_score
                best_match_text = resume_items[j] # Use original text

        # Determine Status based on Best Final Score
        status = "missing"
        if best_final_score >= 0.85:
            status = "strong"
        elif best_final_score >= 0.65:
            status = "partial"
        
        # If missing, don't show the "best match" as it's irrelevant/confusing
        match_text = best_match_text if status != "missing" else None

        results.append({
            "jd_requirement": jd_item,
            "best_match": match_text,
            "confidence": round(best_final_score, 2),
            "status": status
        })

    return results

def calculate_score(resume_sections, jd_text):
    """
    IMPLEMENTS THE COMPREHENSIVE RULE SET
    """
    
    # --- 1. PRE-PROCESSING & EXTRACTION ---
    jd_data = parse_job_description(jd_text)
    required_skills = jd_data["required_skills"]
    preferred_skills = jd_data["preferred_skills"]
    
    full_resume_text = " ".join(resume_sections.values())
    resume_app_skills_map = extract_skills_with_context(full_resume_text)
    resume_skill_set = set(resume_app_skills_map.keys())
    
    # --- 2. SCORING VARIABLES ---
    points_skill = 0
    points_experience = 0
    points_education = 0
    points_quality = 0
    points_bonus = 0
    
    # --- RULE GROUP 1: SKILL MATCHING (40 Points Max) ---
    # R1.1 Required Skill Match (+5 exact)
    # R1.2 Preferred Match (+2 exact)
    # R1.3 Frequency Bonus (+1 if count > 2)
    
    matched_required = []
    matched_preferred = []
    missing_required = []
    
    # Calculation container
    raw_skill_score = 0
    MAX_SKILL_SCORE_POSSIBLE = (len(required_skills) * 5) + (len(preferred_skills) * 2)
    if MAX_SKILL_SCORE_POSSIBLE == 0: MAX_SKILL_SCORE_POSSIBLE = 1 # Avoid div by zero
    
    # 1.1 Required
    for skill in required_skills:
        if skill in resume_skill_set:
            matched_required.append(skill)
            raw_skill_score += 5
            # R1.3 Frequency
            if resume_app_skills_map[skill] >= 3:
                raw_skill_score += 1
        else:
            # Semantic fallback could go here
            missing_required.append(skill)
            raw_skill_score -= 3 # Penalty
            
    # 1.2 Preferred
    for skill in preferred_skills:
        if skill in resume_skill_set:
            matched_preferred.append(skill)
            raw_skill_score += 2
            
    # Normalize to 40% weight
    # We define a "perfect" score relative to the requirements found. 
    # If raw_skill_score is negative, clamp to 0.
    
    # Heuristic: If we matched > 80% of required, that's an A.
    req_match_count = len(matched_required)
    total_req = len(required_skills) if len(required_skills) > 0 else 1
    
    req_ratio = req_match_count / total_req
    points_skill = req_ratio * 40 # Base score on required coverage mostly
    
    # Add bonus for preferred
    if preferred_skills:
         pref_ratio = len(matched_preferred) / len(preferred_skills)
         points_skill += (pref_ratio * 5) # Extra 5 points possible
         
    # Check Semantics for overall "vibe" if low keyword match
    semantic_score = calculate_semantic_similarity(full_resume_text, jd_text)
    if points_skill < 20 and semantic_score > 0.6:
        points_skill += 10 # Boost for implicit match
        
    points_skill = min(40, max(0, points_skill))

    # --- RULE GROUP 2: EXPERIENCE (20 Points) ---
    # R2.1 Years Match
    
    # Extract years from resume
    exp_text = resume_sections.get("experience", "")
    years_found = re.findall(r'(\d+)\+?\s*years?', exp_text)
    resume_years = max([int(y) for y in years_found]) if years_found else 0
    
    # Extract required years from JD (simple regex)
    jd_years_match = re.search(r'(\d+)\+?\s*years?', jd_text)
    required_years = int(jd_years_match.group(1)) if jd_years_match else 2 # Default 2
    
    if resume_years >= required_years:
        points_experience = 20
    elif resume_years > 0:
        # Proportional: e.g. 1 year vs 3 required = 1/3 * 20
        points_experience = (resume_years / required_years) * 20
    else:
        # Check if "Experience" section exists but no number found.
        # If section exists and substantial length, give generic points
        if len(exp_text) > 100:
            points_experience = 10 # Assume some experience if section is populated
        else:
             points_experience = 0
             
    # --- RULE GROUP 3: EDUCATION (10 Points) ---
    # R4.1 Degree Match
    edu_text = resume_sections.get("education", "").lower()
    if "bachelor" in edu_text or "master" in edu_text or "phd" in edu_text or "degree" in edu_text:
        points_education = 10
    elif len(edu_text) > 20:
        points_education = 5
    else:
        points_education = 0
        
    # --- RULE GROUP 4: QUALITY & ATS (10 Points) ---
    # R6.1 Formatting
    # Check for formatting issues (bullet points, length)
    
    points_quality = 10
    if len(full_resume_text) < 500: points_quality -= 5 # R6.2 Short
    if len(full_resume_text) > 4000: points_quality -= 2 # R6.2 Too Long
    if "@" not in full_resume_text: points_quality -= 2 
    
    # --- RULE GROUP 5: BONUS (20 Points distributed) ---
    points_bonus = 0
    
    # Github/Portfolio
    if "github.com" in full_resume_text or "linkedin.com" in full_resume_text or "portfolio" in full_resume_text:
        points_bonus += 5
        
    # Semantic Domain match (re-using earlier calc)
    if semantic_score > 0.4:
        points_bonus += 5
    if semantic_score > 0.7:
        points_bonus += 5
        
    # --- FINAL AGGREGATION ---
    final_score = points_skill + points_experience + points_education + points_quality + points_bonus
    final_score = min(100, max(0, final_score))
    
    return {
        "overall_score": round(final_score),
        "breakdown": {
            "skill_score": round(points_skill, 1),
            "experience_score": round(points_experience, 1),
            "education_score": points_education,
            "quality_score": points_quality,
            "bonus_score": points_bonus,
            "semantic_match": round(semantic_score, 2)
        },
        "skill_match_percent": f"{int((points_skill/40)*100)}%",
        "matched_skills": matched_required + matched_preferred,
        "missing_skills": missing_required,
        "detected_years_experience": resume_years,
        "required_years_experience": required_years
    }
