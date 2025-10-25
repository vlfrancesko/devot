# Full-Stack App — Laravel (Sail) + React (Vite)

This project has two parts:
- **Backend:** Laravel API running in Docker via Sail  
- **Frontend:** React (Vite) single-page app

---

# 📂 Structure

## ⚙️ Backend (Laravel + Sail)

### Setup
```bash
cd backend
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail composer install
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
Then visit → http://localhost

Stop containers:
./vendor/bin/sail down


## 💻 Frontend (React + Vite)

### Setup & run

cd frontend-react
npm install
npm run dev
Open → http://localhost:5173

npm run build

## 🔗 Connection
Set your backend URL in frontend-react/.env
VITE_API_URL=http://localhost


### 🧰 Stack
Backend
Laravel 10+
Sail (Docker, MySQL, Redis)

Frontend

React 18+
Vite
Axios / React Router
