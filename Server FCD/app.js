import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import fileRoutes from "./routes/file.route.js";

const app = express();

// ✅ MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// ✅ GLOBAL REQUEST LOGGER
app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

// ✅ ROUTES
app.use("/api/file", fileRoutes);

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  console.log("✅ TEST ROUTE HIT");
  res.json({ success: true, message: "Server is working!" });
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "Rise Up Backend is running ✅",
    version: "2.0.0"
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  console.error("❌ 404 - Route not found:", req.method, req.url);
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    url: req.url,
  });
});

export default app;
