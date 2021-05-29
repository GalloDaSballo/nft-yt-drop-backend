import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import db from "../db";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db("users").where({ id }).first();
    const { email } = user;
    done(null, { id, email });
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      const user = await db("users").where({ email: username }).first();

      if (!user) {
        return done(null, false, { message: "Incorrect email or password" });
      }

      const hash = crypto
        .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
        .toString("hex");

      const passwordMatch = user.password === hash;

      if (!passwordMatch) {
        return done(null, false, { message: "Incorrect email or password" });
      }

      return done(null, user);
    }
  )
);

export default passport;
