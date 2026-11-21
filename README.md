# 🍔 Foodiee – MERN Stack Food Ordering Application

Foodiee is a full-stack food ordering web application built using the MERN stack. It allows users to explore food items, search and filter products, place orders, make online payments, and track their orders. It also provides an admin dashboard to manage food items and customer orders.

## 🚀 Live Demo

- **Frontend:** https://foodie-beta-two.vercel.app
- **Backend API:** https://foodie-backend-hamm.onrender.com

## ✨ Features

### 👤 User Features
- User registration and login with JWT authentication.
- Browse available food items.
- Search food by name.
- Filter food by category and price.
- Add food items to cart.
- Manage cart items and quantities.
- Place food orders.
- Online payment integration using Razorpay.
- View order history.
- Track order status in real time through periodic updates.
- Submit food reviews and ratings.

### 🛠️ Admin Features
- Admin authentication and protected routes.
- Add new food items with images.
- Update existing food details.
- Delete food items.
- Manage food availability.
- View customer orders.
- Update order status.
- Manage food categories.

## 💻 Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI |
| Vite | Frontend build tool |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB Atlas | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| bcrypt | Password hashing |
| Axios | API requests |
| Cloudinary | Image storage |
| Multer | Image uploads |
| Razorpay | Online payments |
| CSS | Styling |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
Foodiee/
│
├── foodie-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── foodie-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Akshay8789/Foodie.git
cd Foodie
```

### 2. Backend Setup

```bash
cd foodie-backend
npm install
```

Create a `.env` file inside the `foodie-backend` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd foodie-frontend
npm install
```

Create a `.env` file inside `foodie-frontend`.

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### Food Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/foods` | Get all foods |
| GET | `/api/foods/:id` | Get food by ID |
| GET | `/api/foods/categories` | Get categories |
| POST | `/api/foods` | Add food (Admin) |
| PUT | `/api/foods/:id` | Update food (Admin) |
| DELETE | `/api/foods/:id` | Delete food (Admin) |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Get orders |
| GET | `/api/orders/my-orders` | Get user orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/status` | Update order status (Admin) |

*Note: Additional payment and review endpoints are also implemented in the backend.*

## 🔐 Security Features

- JWT-based authentication.
- Password hashing using bcrypt.
- Protected routes using authentication middleware.
- Role-based admin authorization.
- Environment variables for sensitive credentials.
- Image upload validation.

## ☁️ Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
- **Database:** MongoDB Atlas.
- **Image Storage:** Cloudinary.

## 🎯 Key Learning Outcomes

- Developed a full-stack application using MERN architecture.
- Implemented RESTful APIs and JWT authentication.
- Integrated MongoDB Atlas with Mongoose.
- Implemented image uploads using Multer and Cloudinary.
- Integrated Razorpay payment gateway.
- Implemented role-based access control.
- Deployed frontend and backend applications.

## 👨‍💻 Author

**Akshay Rajput**

- GitHub: https://github.com/Akshay8789

---

⭐ If you like this project, consider giving it a star!