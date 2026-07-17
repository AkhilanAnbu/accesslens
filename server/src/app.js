import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import { configurePassport, passport } from "./config/passport.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createPlaceRouter } from "./routes/placeRoutes.js";
import { createReportRouter } from "./routes/reportRoutes.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const clientDirectory = path.resolve(currentDirectory, "../../client/dist");

export function createApp(db) {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      name: "accesslens.sid",
      secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  configurePassport(db);
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", application: "AccessLens" });
  });
  app.use("/api/auth", createAuthRouter(db));
  app.use("/api/places", createPlaceRouter(db));
  app.use("/api/reports", createReportRouter(db));

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found." });
  });

  if (isProduction) {
    app.use(express.static(clientDirectory));
    app.use((req, res, next) => {
      if (req.method === "GET") {
        res.sendFile(path.join(clientDirectory, "index.html"));
        return;
      }
      next();
    });
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}
