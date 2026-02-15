// import dotenv from "dotenv";
// import cors from "cors";
// import express from "express";
// import mongoose from "mongoose";
// import morgan from "morgan";
// import apiRoutes from "./routes/index.js";
// import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// dotenv.config();

// const app = express();

// const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
//   .split(",")
//   .map((value) => value.trim())
//   .filter(Boolean);

// app.use(
//   cors(
//     allowedOrigins.length > 0
//       ? {
//           origin(origin, callback) {
//             if (!origin || allowedOrigins.includes(origin)) {
//               return callback(null, true);
//             }
//             return callback(new Error("Not allowed by CORS"));
//           },
//         }
//       : undefined,
//   ),
// );

// app.use(express.json({ limit: "1mb" }));
// app.use(morgan("dev"));

// app.get("/api/health", (req, res) => {
//   res.json({
//     ok: true,
//     status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
//   });
// });

// app.use("/api", apiRoutes);
// app.use(notFoundHandler);
// app.use(errorHandler);

// const PORT = Number(process.env.PORT ?? 5000);
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Missing MONGODB_URI in environment variables.");
// }

// async function start() {
//   await mongoose.connect(MONGODB_URI);

//   app.listen(PORT, () => {
//     console.log(`Backend server running on http://localhost:${PORT}`);
//   });
// }

// start().catch((err) => {
//   console.error("Failed to start backend:", err);
//   process.exit(1);
// });

import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

/** ------------------------
 * CORS
 * ------------------------ */
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin(origin, callback) {
            // Cho phép request không có origin (curl, mobile app, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
          },
        }
      : undefined,
  ),
);

/** ------------------------
 * Middlewares
 * ------------------------ */
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/** ------------------------
 * MongoDB (serverless-safe)
 * ------------------------ */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

// Cache connection trong môi trường serverless (tránh connect lại nhiều lần)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Các option này tuỳ phiên bản mongoose/node, không bắt buộc.
        // serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Đảm bảo DB đã connect trước khi xử lý route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

/** ------------------------
 * Routes
 * ------------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", apiRoutes);

/** ------------------------
 * Error handlers
 * ------------------------ */
app.use(notFoundHandler);
app.use(errorHandler);

/** ------------------------
 * IMPORTANT:
 * - KHÔNG app.listen() trên Vercel
 * - Export app để Vercel handle
 * ------------------------ */
export default app;