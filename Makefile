.PHONY: up down logs frontend backend install-frontend install-backend

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

