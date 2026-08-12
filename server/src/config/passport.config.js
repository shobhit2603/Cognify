import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import envConfig from "./env.config.js";

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "temp-client-id",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "temp-client-secret",
        callbackURL: "/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Pass the profile to the callback in the controller
          return done(null, profile);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // We are using stateless JWT authentication, so we don't need to serialize/deserialize user into session
  // However, passport requires these methods to be defined or we might face issues depending on how we call authenticate
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
