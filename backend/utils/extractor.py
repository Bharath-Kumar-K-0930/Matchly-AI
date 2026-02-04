SECTIONS_PATTERNS = {
    "education": ["education", "academic background", "qualifications", "education & certifications"],
    "experience": ["experience", "work experience", "employment history", "work history", "professional experience"],
    "skills": ["skills", "technical skills", "technologies", "core competencies", "technical proficiency"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "certifications": ["certifications", "credentials", "licenses", "courses"],
}

def extract_sections(raw_text):
    """
    Splits the raw text into sections based on heuristic keywords.
    """
    text = raw_text.strip()
    lines = text.split('\n')
    
    sections = {
        "education": "",
        "experience": "",
        "skills": "",
        "projects": "",
        "certifications": "",
        "others": ""
    }
    
    current_section = "others"
    
    # Simple state machine
    for line in lines:
        line_clean = line.strip().lower()
        # Remove common bullet points or colons for checking
        line_check = line_clean.strip(":-•* ")
        
        found_new_section = False
        
        # Heuristic: Headers are usually short (< 50 chars) and contain specific keywords
        if len(line_check) < 50 and len(line_check) > 2: 
             for section, keywords in SECTIONS_PATTERNS.items():
                # Check for exact match or "contains" if highly specific
                # We check if the line STARTS with the keyword or IS the keyword
                if any(line_check == k or line_check.startswith(k + " ") for k in keywords):
                    current_section = section
                    found_new_section = True
                    break
        
        # If it's a header line, we might not want to append it to the content? 
        # Or maybe we do to keep context. Let's append everything for now but bucketed.
        # Ideally, we skip appending the header to the PREVIOUS section.
        
        sections[current_section] += line + "\n"
            
    return sections
