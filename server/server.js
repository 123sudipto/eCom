require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const connectDB = require("./config/db");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const AppError = require("./utils/appError");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

connectDB();


// Global Middlewares

app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());                                       // Set security HTTP headers
app.use(xss());                                         // Prevent XSS attacks
app.use(mongoSanitize());                              // Prevent NoSQL injection
app.use(hpp());                                       // Prevent HTTP param pollution

// Rate limiter (prevent brute force attacks)

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,                              // 1 hour
  message: "Too many requests from this IP, please try again in an hour!"
});
app.use("/api", limiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);

async function createAdminUser() {
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@example.com' });
  if (!existingAdmin) {
    const adminUser = new User({
      name: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      isAdmin: true
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);
  } else {
    console.log('Admin user already exists:', existingAdmin.email);
  }
}

createAdminUser().catch(console.error);

app.all("*", (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = express.Router();
