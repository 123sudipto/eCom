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
const globalErrorHandler = require("./middleware/auth");
const AppError = require("./utils/appError");

const authRoutes = require("./routes/authRoute");
const productRoutes = require("./routes/productRoute");
const orderRoutes = require("./routes/orderRoute");
const adminRoutes = require("./routes/adminRoute");


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

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
