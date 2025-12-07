import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Connect to MongoDB
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ SERVER RUNNING ON PORT ${PORT}`);
      console.log(`✅ Backend URL: http://localhost:${PORT}`);
      console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
      console.log(`✅ API endpoint: http://localhost:${PORT}/api\n`);
    });

    // Handle server errors
    app.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error(`   Please stop the other process or change PORT in .env`);
      } else {
        console.error("❌ Server error:", err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
