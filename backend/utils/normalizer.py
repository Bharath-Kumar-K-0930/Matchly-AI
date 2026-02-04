import re
from .it_taxonomy_data import NORMALIZATION_MAP, IT_TAXONOMY

def normalize_skill(skill_name: str) -> str:
    """
    Normalizes an IT skill name to its canonical form using the NORMALIZATION_MAP.
    Falls back to lowercase/cleaned string if not in map.
    """
    if not skill_name:
        return ""
    
    # 1. Basic Cleaning
    cleaned = skill_name.strip().lower()
    
    # 2. Check direct map
    if cleaned in NORMALIZATION_MAP:
        return NORMALIZATION_MAP[cleaned]
    
    # 3. Fuzzy match / Pattern match for common variations
    # Example: "react.js" -> "react" (if not in map)
    # But since we have a comprehensive map, we can rely on it mostly.
    
    # 4. Canonical lookup (case-insensitive)
    for category, skills in IT_TAXONOMY.items():
        if cleaned in skills:
            return cleaned
            
    return cleaned

def get_skill_category(skill_name: str) -> str:
    """
    Returns the category for a given normalized skill.
    """
    normalized = normalize_skill(skill_name)
    for category, skills in IT_TAXONOMY.items():
        if normalized in skills:
            return category
    return "other"
