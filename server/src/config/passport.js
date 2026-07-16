import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ObjectId } from "mongodb";
import { verifyPassword } from "../utils/password.js";

export function configurePassport(db) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
          if (!user || !(await verifyPassword(password, user.passwordHash))) {
            done(null, false, { message: "Incorrect email or password." });
            return;
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toHexString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
}

export { passport };
