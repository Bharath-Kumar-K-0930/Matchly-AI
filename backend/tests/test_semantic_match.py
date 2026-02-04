
import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.scorer import semantic_match

def run_test(name, jd_text, resume_text, expected_statuses, max_score=None, min_score=None):
    print(f"Testing {name}...")
    result = semantic_match([jd_text], [resume_text])
    item = result[0]
    score = item['confidence']
    status = item['status']
    
    print(f"  JD: {jd_text}")
    print(f"  Resume: {resume_text}")
    print(f"  Result: {status} (Score: {score})")
    
    match = False
    if status in expected_statuses: match = True
    
    # Check score bounds if provided
    if max_score is not None and score > max_score: match = False
    if min_score is not None and score < min_score: match = False

    if match:
        print("✅ Passed\n")
        return True
    else:
        print(f"❌ FAILED: Expected {expected_statuses} [Min: {min_score}, Max: {max_score}], got {status} ({score})\n")
        return False

if __name__ == "__main__":
    print("=== RUNNING SEMANTIC MATCH DIAGNOSTICS ===\n")
    
    failures = 0
    
    # 1. Strong
    if not run_test("Strong Match", "Develop REST APIs using FastAPI", "Built REST APIs using FastAPI and PostgreSQL", ["strong"]): failures += 1
    
    # 2. Partial (The problematic one)
    if not run_test("Partial Match", "Build scalable backend systems", "Optimized API performance and reduced latency", ["partial", "strong"]): failures += 1
    
    # 3. Missing
    if not run_test("Missing Match", "Docker containerization", "Built backend services using Django", ["missing"]): failures += 1
    
    # 4. Implicit
    if not run_test("Implicit Skill", "Experience with cloud-native architectures", "Deployed microservices on AWS using Kubernetes", ["strong", "partial"]): failures += 1
    
    # 5. False Positive
    # We expect this to NOT be strong. Partial is acceptable for "java" vs "javascript" as they are related languages, but "missing" is better.
    # Definitely < 0.80
    if not run_test("False Positive (Java vs JS)", "Expert in Java for backend", "Frontend developer using JavaScript and React", ["missing", "partial"], max_score=0.79): failures += 1

    print(f"Tests Completed. Failures: {failures}")
    if failures > 0:
        exit(1)
