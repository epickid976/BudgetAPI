import { Router } from "express";
import { db } from "../api/src/config/db.js";

export const healthRouter = Router();

// GET /health - Basic health check
healthRouter.get("/", async (req, res) => {
  try {
    // Test database connection
    await db.execute({ sql: "SELECT 1" });
    
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: "disconnected",
      error: "Database connection failed"
    });
  }
});

// GET /health/ready - Readiness probe (for Kubernetes/Docker)
healthRouter.get("/ready", async (req, res) => {
  try {
    // Test database connection
    await db.execute({ sql: "SELECT 1" });
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: "Database not ready" });
  }
});

// GET /health/live - Liveness probe (for Kubernetes/Docker)
healthRouter.get("/live", (req, res) => {
  res.status(200).json({ alive: true });
});

