import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/auth.route.js";
import fileRoutes from "./routes/file.route.js";
import aiRoutes from "./routes/ai.route.js";
import accessRoutes from "./routes/access.route.js";


const app = express();

// ✅ MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ GLOBAL REQUEST LOGGER
app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/access", accessRoutes)


// ✅ TEST ROUTE (CRITICAL)
app.get("/test", (req, res) => {
  console.log("✅ TEST ROUTE HIT");
  res.send("SERVER WORKING");
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Secure Docs Backend is running ✅");
});

export default app;
