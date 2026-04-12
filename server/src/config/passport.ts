// server/src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Student from "../modules/student/student.model";
import { ENV } from "./env";

passport.use(
    new GoogleStrategy(
        {
            clientID: ENV.GOOGLE_CLIENT_ID,
            clientSecret: ENV.GOOGLE_CLIENT_SECRET,
            callbackURL: ENV.GOOGLE_CALLBACK_URL,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email || !email.endsWith("@smail.iitm.ac.in")) {
                    return done(null, false);
                }

                let student = await Student.findOne({ email });

                if (!student) {
                    student = await Student.create({
                        email,
                        name: profile.displayName,
                        profilePicture: profile.photos?.[0]?.value,
                    });
                }

                return done(null, student);
            } catch (error) {
                return done(error as Error, false);
            }
        }
    )
);

export default passport;
