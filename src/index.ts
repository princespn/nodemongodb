import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import routes from "./routes/routes";
import posts from "./routes/posts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

const connectWithRetry = () => {
    mongoose.connect(MONGOURL as string)
        .then(() => {
            console.log('Database connected');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error('Database connection error:', error);
            setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
        });
};

if (!MONGOURL) {
    console.error("MONGO_URL is not defined in the environment variables");
    process.exit(1);
}

connectWithRetry();

// Express session middleware
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use('/api/posts', posts);

export default app;
