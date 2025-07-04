<!-- # Shoe Store eCommerce Platform

A full-stack eCommerce web application for selling shoes, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Customer Features
- User authentication (register/login)
- Browse shoe catalog
- Shopping cart management
- Secure checkout with Razorpay
- Order history

### Admin Features
- Product management (CRUD operations)
- Inventory management
- Order management
- User management

## Tech Stack

### Frontend
- React.js
- Tailwind CSS (with dark mode)
- React Router DOM
- Context API for state management
- Vite for build tooling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Razorpay integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Razorpay account for payments

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shoe-store
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in both client and server directories
- Fill in the required environment variables

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd client
npm run dev
```

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Server (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Deployment

- Frontend: Deploy to Vercel
- Backend: Deploy to Render/Railway

## License

MIT  -->