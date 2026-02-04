# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (needed for some Python packages)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We leverage caching by copying requirements first
RUN pip install --no-cache-dir -r requirements.txt

# Download the Spacy model during build
RUN python -m spacy download en_core_web_sm

# Copy the rest of the backend code
COPY . .

# Expose port (Render sets $PORT env var, we default to 8000)
ENV PORT=8000
EXPOSE ${PORT}

# Memory Optimization for Free Tier (Render 512MB Limit)
# 1. Force Single Worker to reduce overhead
ENV WEB_CONCURRENCY=1
# 2. Reduce Python Memory Fragmentation
ENV MALLOC_ARENA_MAX=2

# Run uvicorn server binding to the PORT environment variable
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT}"
