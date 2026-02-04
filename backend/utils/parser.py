import pdfplumber
import docx
import fitz  # PyMuPDF
import io

def extract_text_from_pdf(file_stream):
    """
    Extract text from PDF using pdfplumber (primary) and PyMuPDF (fallback/supplement).
    file_stream: bytes or file-like object.
    """
    text = ""
    try:
        # Try pdfplumber first for better layout preservation often
        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}, trying PyMuPDF")
        try:
            # RESET stream if needed, but pdfplumber might not consume it fully if it failed? 
            # Safest to rely on passed bytes. If stream, seek 0.
             if hasattr(file_stream, 'seek'):
                file_stream.seek(0)
             
             with fitz.open(stream=file_stream.read(), filetype="pdf") as doc:
                for page in doc:
                    text += page.get_text() + "\n"
        except Exception as e2:
            print(f"PyMuPDF also failed: {e2}")
            return ""
            
    return text

def extract_text_from_docx(file_stream):
    """
    Extract text from DOCX using python-docx.
    file_stream: bytes or file-like object.
    """
    try:
        doc = docx.Document(file_stream)
        text = []
        for para in doc.paragraphs:
            text.append(para.text)
        return "\n".join(text)
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def extract_text(file_content, filename):
    """
    Unified extractor based on file extension.
    file_content: bytes
    filename: str
    """
    file_stream = io.BytesIO(file_content)
    
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_stream)
    elif filename.lower().endswith('.docx'):
        return extract_text_from_docx(file_stream)
    else:
        return ""
