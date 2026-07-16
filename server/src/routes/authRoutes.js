import { Router } from "express";
import { passport } from "../config/passport.js";
import { hashPassword } from "../utils/password.js";
import { cleanText, isEmail } from "../utils/validation.js";
import { publicUser } from "../utils/serializers.js";

export function createAuthRouter(db) {
  const router = Router();
  const users = db.collection("users");

  router.get("/me", (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  router.post("/register", async (req, res, next) => {
    try {
      const name = cleanText(req.body.name, 80);
      const email = cleanText(req.body.email, 160).toLowerCase();
      const password = typeof req.body.password === "string" ? req.body.password : "";

      if (name.length < 2) {
        res.status(400).json({ error: "Name must contain at least two characters." });
        return;
      }
      if (!isEmail(email)) {
        res.status(400).json({ error: "Enter a valid email address." });
        return;
      }
      if (password.length < 8 || password.length > 128) {
        res.status(400).json({ error: "Password must be between 8 and 128 characters." });
        return;
      }

      const existingUser = await users.findOne({ email });
      if (existingUser) {
        res.status(409).json({ error: "An account already exists for this email." });
        return;
      }

      const user = {
        name,
        email,
        passwordHash: await hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await users.insertOne(user);
      user._id = result.insertedId;

      req.login(user, (error) => {
        if (error) {
          next(error);
          return;
        }
        res.status(201).json({ user: publicUser(user) });
      });
    } catch (error) {
      if (error?.code === 11000) {
        res.status(409).json({ error: "An account already exists for this email." });
        return;
      }
      next(error);
    }
  });

  router.post("/login", (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        next(error);
        return;
      }
      if (!user) {
        res.status(401).json({ error: info?.message || "Unable to sign in." });
        return;
      }
      req.login(user, (loginError) => {
        if (loginError) {
          next(loginError);
          return;
        }
        res.json({ user: publicUser(user) });
      });
    })(req, res, next);
  });

  router.post("/logout", (req, res, next) => {
    req.logout((error) => {
      if (error) {
        next(error);
        return;
      }
      req.session.destroy(() => {
        res.clearCookie("accesslens.sid");
        res.status(204).end();
      });
    });
  });

  return router;
}
