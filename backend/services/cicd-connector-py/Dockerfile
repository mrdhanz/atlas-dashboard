FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use Gunicorn for production
EXPOSE 8082
CMD ["gunicorn", "--bind", "0.0.0.0:8082", "app:app"]