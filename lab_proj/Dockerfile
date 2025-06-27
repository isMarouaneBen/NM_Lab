FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app/backend

# Copy requirements first for better caching
COPY requirements.txt ./

# Debug: List files to confirm requirements.txt is copied
RUN ls -la

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Debug: Show what was installed
RUN pip list

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 8000

# Run server on all interfaces and correct port
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]