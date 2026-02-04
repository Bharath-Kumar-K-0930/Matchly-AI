from utils.normalizer import normalize_skill
import re

def generate_ai_insights(resume_sections, jd_text, analysis_result):
    """
    Deterministically generates "AI" insights based on the rule scores.
    Implements Rule Group 9: Explanation & Feedback Rules.
    """
    
    score = analysis_result["overall_score"]
    matching_skills = analysis_result["matched_skills"]
    missing_skills = analysis_result["missing_skills"]
    breakdown = analysis_result["breakdown"]
    
    summary = ""
    strengths = []
    weaknesses = []
    action_plan = []
    interview_questions = []
    
    # 1. Summary Generation Logic
    if score >= 85:
        summary = f"**Excellent Match ({score}/100)**. Your profile is highly aligned with the Job Description, covering majority of the critical skills and experience requirements. This resume passes nearly all ATS filters."
    elif score >= 70:
        summary = f"**Good Match ({score}/100)**. You have a solid core competency for this role, but there are specific missing keywords or experience gaps that might lower your ranking against perfect candidates."
    elif score >= 50:
        summary = f"**Average Match ({score}/100)**. While you have some relevant background, important required skills are missing from your resume's text. An ATS might filter this out unless optimized."
    else:
        summary = f"**Low Match ({score}/100)**. Significant gaps detected between your resume and the core requirements of this role. Consider heavily tailoring your resume or upskilling."
        
    # 2. Strengths (Rule-Based)
    if breakdown["experience_score"] >= 15:
        strengths.append(f"**Experience Aligned**: Your detected experience level ({analysis_result['detected_years_experience']} years) meets or exceeds the JD requirements.")
    
    if len(matching_skills) > 4:
        strengths.append(f"**Strong Tech Stack**: You have exact keyword matches for key tools: {', '.join(matching_skills[:5])}.")
    
    if breakdown["semantic_match"] > 0.6:
        strengths.append("**Contextual Fit**: Even outside of direct keywords, the semantic language of your resume aligns well with the industry domain of the job.")

    if breakdown["bonus_score"] >= 5:
        strengths.append("**Portfolio Presence**: Links to Github/Portfolio provide strong proof-of-work signals.")

    # 3. Weaknesses & Actions (The most critical part for user value)
    
    # 3.1 Missing Skills
    if missing_skills:
        top_missing = missing_skills[:5]
        weaknesses.append(f"**Critical Skill Gaps**: The following high-priority keywords are missing: {', '.join(top_missing)}.")
        action_plan.append(f"**Add Keywords**: Ensure {', '.join(top_missing[:3])} are explicitly listed in your 'Skills' or 'Projects' section.")
        
        # Interview prep based on missing skills (Rule Group 9)
        for skill in top_missing[:2]:
            interview_questions.append(f"We see you don't list {skill} on your resume. How would you handle a task requiring {skill}?")
    
    # 3.2 Experience
    if breakdown["experience_score"] < 10:
        diff = analysis_result["required_years_experience"] - analysis_result["detected_years_experience"]
        if diff > 0:
            weaknesses.append(f"**Experience Gap**: JD likely requires ~{analysis_result['required_years_experience']} years, but we detected {analysis_result['detected_years_experience']} years.")
            action_plan.append("If you have more years, ensure they are clearly labeled in a standard date format (e.g. 'Jan 2020 - Present').")
    
    # 3.3 Formatting
    if breakdown["quality_score"] < 10:
        weaknesses.append("**Formatting Issues**: Resume might be too short, too long, or missing contact info.")
        action_plan.append("Ensure your resume is 1-2 pages, has your email, and avoids complex tables/images.")
        
    # 4. Interview Questions (Tech based) - Rule Group 9/10
    if matching_skills:
        skill = matching_skills[0]
        interview_questions.append(f"Can you walk me through a challenging problem you solved using **{skill}**?")
        
    if breakdown["education_score"] < 5:
        action_plan.append("If you have a relevant degree, ensure it is clearly listed under an 'Education' section.")
    # Fallback questions
    if len(interview_questions) < 2:
        interview_questions.append("Describe a project where you had to learn a new technology quickly.")

    return {
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "action_plan": action_plan,
        "interview_questions": interview_questions
    }
