# 🔍 Lost & Found — Item Management System

A full-stack **MERN** web application to report, search, and manage lost and found items. Users can register, log in, and securely manage item listings through a clean and responsive interface.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Axios    |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Build Tool | Vite                                |

---

## 📁 Project Structure

```
LostFound/
├── Client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Reusable components (PrivateRoute, etc.)
│   │   ├── context/        # Auth context (global state)
│   │   └── pages/          # Login, Register, Dashboard
│   └── index.html
│
└── Server/                 # Express backend
    ├── controllers/        # authController, itemController
    ├── middleware/         # JWT auth middleware
    ├── models/             # User, Item Mongoose models
    ├── routes/             # Auth & Item routes
    └── server.js           # Entry point
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/DeepakGhenyar/LostFound.git
cd LostFound
```

---

### 2. Setup Backend (Server)

```bash
cd Server
npm install
```

Create a `.env` file inside `Server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
```

Start the server:

```bash
npm run dev       # Development (nodemon)
# or
npm start         # Production
```

Server runs at: `http://localhost:5000`

---

### 3. Setup Frontend (Client)

```bash
cd Client
npm install
npm run dev
```

Client runs at: `http://localhost:5173`

---

## 🔗 API Endpoints

### Auth Routes
| Method | Endpoint         | Description         | Auth Required |
|--------|------------------|---------------------|---------------|
| POST   | `/api/register`  | Register new user   | ❌            |
| POST   | `/api/login`     | Login & get token   | ❌            |
| GET    | `/api/dashboard` | Protected dashboard | ✅            |

### Item Routes (all protected)
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/items`                | Add a new item        |
| GET    | `/api/items`                | Get all items         |
| GET    | `/api/items/:id`            | Get item by ID        |
| GET    | `/api/items/search?name=xyz`| Search items by name  |
| PUT    | `/api/items/:id`            | Update an item        |
| DELETE | `/api/items/:id`            | Delete an item        |

---

## 🌐 Pages

| Page       | Route       | Description                         |
|------------|-------------|-------------------------------------|
| Register   | `/register` | Create a new account                |
| Login      | `/login`    | Login with email & password         |
| Dashboard  | `/`         | View and manage lost & found items  |

---

## 🔒 Authentication Flow

1. User registers → password hashed with **bcryptjs**
2. User logs in → receives a **JWT token**
3. Token stored in **AuthContext** (React state)
4. Protected routes use **PrivateRoute** component
5. API requests send token via `Authorization: Bearer <token>` header

---

## 📝 Environment Variables

| Variable     | Description                     |
|--------------|---------------------------------|
| `MONGO_URI`  | MongoDB connection string        |
| `JWT_SECRET` | Secret key for signing JWT      |
| `PORT`       | Server port (default: 5000)     |

> ⚠️ Never commit your `.env` file. It is already added to `.gitignore`.

---

## 👨‍💻 Author

**Deepak Ghenyar**  
GitHub: [@DeepakGhenyar](https://github.com/DeepakGhenyar)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
