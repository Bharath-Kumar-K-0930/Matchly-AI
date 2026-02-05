from .schemas import ParsedResume, ParsedJobDescription, MatchScore, MatchReportItem, SkillGapAnalysis
from .scorer import calculate_semantic_similarity, semantic_match
from .normalizer import normalize_skill
import re

def advanced_match(resume: ParsedResume, jd: ParsedJobDescription) -> MatchScore:
    """
    IT-Optimized Matching Engine.
    Weights: Skills (35%), Responsibilities (25%), Exp (20%), Stacks (10%), ATS Coverage (10%)
    """
    
    # 1. NEW IT WEIGHTS
    weights = {
        "skills": 35,
        "resp": 25,
        "exp": 20,
        "stacks": 10,
        "ats": 10
    }
    
    detailed_report = []
    
    # --- PREPARE ASSETS ---
    resume_skills = resume.technical_skills_with_evidence
    # Normalize resume skill names for consistent matching
    resume_skill_names = [normalize_skill(s.skill) for s in resume_skills]
    
    # --- CAT 1: SKILLS (LANGUAGES + FRAMEWORKS) - 35% ---
    score_skills = 0.0
    jd_required_raw = jd.required_skills
    # Normalize JD requirements
    jd_required = [normalize_skill(r) for r in jd_required_raw]
    
    if jd_required:
        points_per = weights["skills"] / len(jd_required)
        # Use semantic match with new thresholds
        results = semantic_match(jd_required, resume_skill_names, threshold=0.65)
        
        for i, res in enumerate(results):
            match_points = 0.0
            status = res["status"]
            best_match = res["best_match"]
            confidence = res["confidence"]
            
            if status == "strong":
                match_points = points_per
            elif status == "partial":
                match_points = points_per * confidence
            
            # Boost for context
            if best_match:
                # Find evidence for the best matched skill
                evidence = next((s for s in resume_skills if normalize_skill(s.skill) == best_match), None)
                if evidence and evidence.context in ["experience", "project"]:
                    match_points = min(points_per, match_points * 1.1)

            score_skills += match_points
            detailed_report.append(MatchReportItem(
                job_requirement=jd_required_raw[i],
                match_status=status,
                resume_evidence=f"Matched to {best_match}" if best_match else "No technical evidence",
                confidence=confidence,
                category="skill",
                score_impact=round(match_points, 2)
            ))
    else: score_skills = weights["skills"]

    # --- CAT 2: RESPONSIBILITIES & SYSTEMS - 25% ---
    jd_resp_text = " ".join(jd.responsibilities)
    resume_exp_text = " ".join([" ".join(e.technical_responsibilities) for e in resume.experience])
    resp_overlap = calculate_semantic_similarity(resume_exp_text, jd_resp_text) if jd_resp_text else 1.0
    score_resp = weights["resp"] * resp_overlap
    detailed_report.append(MatchReportItem(
        job_requirement="Technical Responsibilities",
        match_status="strong" if resp_overlap >= 0.85 else "partial" if resp_overlap >= 0.65 else "missing",
        resume_evidence=f"Semantic overlap: {int(resp_overlap*100)}%",
        confidence=resp_overlap,
        category="responsibility",
        score_impact=round(score_resp, 2)
    ))

    # --- CAT 3: EXPERIENCE DEPTH - 20% ---
    req_years = jd.minimum_experience_years or 2
    total_years = resume.total_experience_years or 0
    exp_factor = min(1.0, total_years / req_years) if req_years > 0 else 1.0
    score_exp = weights["exp"] * exp_factor

    # --- CAT 4: TOOLS / CLOUD / DATABASES - 10% ---
    score_stack = 0.0
    jd_stack_raw = list(set(jd.frameworks_and_tools + jd.databases + jd.cloud_platforms))
    jd_stack = [normalize_skill(s) for s in jd_stack_raw]
    
    if jd_stack:
        points_per_stack = weights["stacks"] / len(jd_stack)
        stack_results = semantic_match(jd_stack, resume_skill_names, threshold=0.65)
        for i, res in enumerate(stack_results):
            status = res["status"]
            confidence = res["confidence"]
            match_pts = 0.0
            
            if status == "strong":
                match_pts = points_per_stack
            elif status == "partial":
                match_pts = points_per_stack * confidence
                
            score_stack += match_pts
            detailed_report.append(MatchReportItem(
                job_requirement=jd_stack_raw[i],
                match_status=status,
                resume_evidence=res["best_match"],
                confidence=confidence,
                category="stack",
                score_impact=round(match_pts, 2)
            ))
    else: score_stack = weights["stacks"]

    # --- CAT 5: ATS KEYWORD COVERAGE - 10% ---
    score_ats = 0.0
    if jd.ats_keywords:
        normalized_ats = [normalize_skill(kw) for kw in jd.ats_keywords]
        found_keywords = [kw for kw in normalized_ats if kw in resume_skill_names]
        coverage = len(found_keywords) / len(jd.ats_keywords)
        score_ats = weights["ats"] * coverage
    else: score_ats = weights["ats"]

    # --- FINAL SCORE ---
    final_score = score_skills + score_resp + score_exp + score_stack + score_ats
    
    # Calculate Skill Match % for UI
    total_req_count = len(jd_required) if jd_required else 1
    match_ratio = score_skills / weights["skills"] if weights["skills"] > 0 else 1.0
    skill_percent_str = f"{int(match_ratio * 100)}%"

    # Generate Skill Gaps
    gap_analysis = []
    missing_skills_list = []
    matched_skills_list = []
    
    matched_set = set()
    missing_set = set()
    gap_seen_set = set()
    
    for item in detailed_report:
        # Skip generic responsibility items for skill lists
        if item.category == "responsibility":
            continue
            
        skill_key = item.job_requirement.strip().lower()

        if item.match_status == "missing":
            if skill_key not in missing_set:
                missing_skills_list.append(item.job_requirement)
                missing_set.add(skill_key)
            
            if skill_key not in gap_seen_set:
                gap_analysis.append(SkillGapAnalysis(
                    skill=item.job_requirement,
                    severity="high",
                    reason="No technical evidence found in experience or projects.",
                    how_to_improve=f"Complete a project or certification involving {item.job_requirement} to demonstrate capability."
                ))
                gap_seen_set.add(skill_key)
                
        elif item.match_status == "strong":
            if skill_key not in matched_set:
                matched_skills_list.append(item.job_requirement)
                matched_set.add(skill_key)
                
        elif item.match_status == "partial":
            if skill_key not in matched_set:
                matched_skills_list.append(f"{item.job_requirement} (Partial)")
                matched_set.add(skill_key)
            
            if skill_key not in gap_seen_set:
                gap_analysis.append(SkillGapAnalysis(
                    skill=item.job_requirement,
                    severity="medium",
                    reason=f"Found limited evidence or related technology ({item.resume_evidence}).",
                    how_to_improve=f"Deepen expertise in {item.job_requirement} by implementing more complex features."
                ))
                gap_seen_set.add(skill_key)

    return MatchScore(
        overall_score=int(final_score),
        breakdown={
             "skill_score": round(score_skills, 1),
             "responsibility_score": round(score_resp, 1),
             "experience_score": round(score_exp, 1),
             "stack_score": round(score_stack, 1),
             "ats_score": round(score_ats, 1),
             "education_score": 10.0,
             "bonus": 5.0 
        },
        missing_critical_skills=missing_skills_list,
        missing_skills=missing_skills_list,
        matched_skills=matched_skills_list,
        detailed_match_report=detailed_report,
        skill_gap_analysis=gap_analysis,
        skill_match_percent=skill_percent_str,
        detected_years_experience=total_years,
        required_years_experience=req_years
    )
