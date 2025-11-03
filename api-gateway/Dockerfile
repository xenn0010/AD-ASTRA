FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

ENV API_GATEWAY_PORT=8888

CMD ["python", "server.py"]
