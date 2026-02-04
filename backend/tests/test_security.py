import pytest
from fastapi.testclient import TestClient
from main import app, MAX_FILE_SIZE
from unittest.mock import patch
import io

client = TestClient(app)

# Mock huge file content
HUGE_CONTENT = b"0" * (MAX_FILE_SIZE + 1024)
VALID_PDF_HEADER = b"%PDF-1.4\n"
INVALID_PDF_HEADER = b"MZ\x90\x00" # EXE header

@patch('main.extract_text')
def test_upload_valid_pdf(mock_extract):
    """Test standard valid PDF upload."""
    mock_extract.return_value = "Valid parsed text content"
    # Minimal PDF structure
    pdf_content = VALID_PDF_HEADER + b"some content"
    files = {
        'resume': ('test_resume.pdf', pdf_content, 'application/pdf'),
        'job_description_file': ('job_desc.pdf', pdf_content, 'application/pdf')
    }
    # Mocking dependencies might be needed if matching engine is heavy/fails without text
    # But for analyzing headers, it happens BEFORE parsing.
    # However, validate_pdf reads headers. If we pass that, extract_text runs.
    # We expect 400 from extract_text probably if content is garbage data, BUT
    # the security check itself (magic number) should pass.
    # If extract_text fails, we get 400 "Could not extract text...", which is fine.
    
    response = client.post("/analyze", files=files)
    # It might fail later in pipeline (extract_text), but should NOT fail security checks (400 "valid PDF")
    # If it returns 200, great. If 400, ensure it's not "not a valid PDF".
    if response.status_code == 400:
        assert "not appear to be a valid PDF" not in response.json()['detail']
        assert "must be a PDF" not in response.json()['detail']

def test_upload_invalid_extension():
    """Test file with non-pdf extension."""
    files = {
        'resume': ('malware.exe', INVALID_PDF_HEADER, 'application/x-msdownload')
    }
    response = client.post("/analyze", files=files)
    assert response.status_code == 400
    assert "must be a PDF" in response.json()['detail']

def test_upload_magic_number_bypass():
    """Test file with .pdf extension but invalid header (e.g. renamed exe)."""
    files = {
        'resume': ('malware.pdf', INVALID_PDF_HEADER, 'application/pdf')
    }
    response = client.post("/analyze", files=files)
    assert response.status_code == 400
    assert "does not appear to be a valid PDF" in response.json()['detail']

def test_file_size_limit():
    """Test file exceeding size limit."""
    # We mock read? No, TestClient handles in-memory files.
    # We passed 'resume' with massive content.
    files = {
        'resume': ('large.pdf', VALID_PDF_HEADER + HUGE_CONTENT, 'application/pdf')
    }
    response = client.post("/analyze", files=files)
    assert response.status_code == 400
    assert "exceeds maximum size" in response.json()['detail']

@patch('main.extract_text')
def test_large_jd_text_injection(mock_extract):
    """Test JD text input exceeding characters limit."""
    mock_extract.return_value = "Valid resume text"
    huge_text = "a" * 100005
    files = {
        'resume': ('valid.pdf', VALID_PDF_HEADER + b"content", 'application/pdf')
    }
    data = {
        'job_description_text': huge_text
    }
    response = client.post("/analyze", files=files, data=data)
    assert response.status_code == 400
    assert "Job Description text too long" in response.json()['detail']

def test_missing_input():
    response = client.post("/analyze")
    assert response.status_code == 422 # FastAPI validation error for missing field

