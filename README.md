# 🚖 Deligo – Ride Service Backend

Deligo is a scalable backend service for a ride-hailing platform. Built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma**, it provides robust APIs for managing users, drivers, rides, and trip statuses — laying the foundation for real-time ride-matching and trip management.

---

## 📋 Summary

Deligo powers the backend of a ride-sharing application, supporting:

- **User & driver registration/authentication**
- **Ride requests and driver assignment**
- **Trip tracking (start, in-progress, complete)**
- **Payment status handling**
- **Scalable database access with Prisma ORM**

Ideal for launching MVPs or scaling toward production.

---

## 🚀 Features

- Node.js + Express REST API
- PostgreSQL with Prisma ORM
- Environment-based config via `.env`
- Basic modular structure: Users, Drivers, Rides
- Prisma migrations and Studio for DB management
- Docker (optional) for easy DB setup

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- dotenv
- Nodemon (dev only)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/arifuzzaman31/apideligo.git
cd apideligo/
```
### 2. Install dependencies
```bash
npm install
```
### ⚙️ Environment Configuration
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/deligo"
PORT=3000
```
### 🧱 Prisma Setup
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run reset
```
### 🚗 Running the Server
```bash
npm run dev
```
### 📁 Project Structure
```bash
/src
  /prisma
    schema.prisma
  /routes
    user.routes.js
    driver.routes.js
    ride.routes.js
  /controllers
  /services
  /middleware
  app.js
.env
package.json
```
