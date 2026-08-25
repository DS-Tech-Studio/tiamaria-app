# Tía María App — Order & Logistics Management System

Enterprise full-stack monorepo designed for real-time order tracking, mobile sales processing, and inventory management for artisan products.

Developed and maintained by **DS Tech Studio**.

---

## 🏗️ Tech Stack

- **Backend:** NestJS, TypeScript, TypeORM, PostgreSQL, WebSockets (`socket.io`).
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Axios.
- **Architecture:** Monorepo using **npm workspaces**.

---

## 📁 Repository Structure

```text
tiamaria-app/
├── apps/
│   ├── backend/     # NestJS REST API & WebSocket Server
│   └── frontend/    # React + Vite Client Application
├── package.json     # Workspace root scripts & dependencies
└── README.md

🚀 Quick Start
Prerequisites
Node.js >= 18.x

PostgreSQL >= 15.x

Installation
Clone the repository:

git clone [https://github.com/DS-Tech-Studio/tiamaria-app.git](https://github.com/DS-Tech-Studio/tiamaria-app.git)
cd tiamaria-app

Install all workspace dependencies:
npm install

Configure Environment Variables:
Create a .env file inside apps/backend/ following .env.example.

Run Development Servers:
# Run NestJS Backend (http://localhost:3000)
npm run dev:backend

# Run React Frontend (http://localhost:5173)
npm run dev:frontend

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

---

### 3. Mensaje de Commit para esta Tarea

Ejecuta en tu terminal:

```cmd
git add .