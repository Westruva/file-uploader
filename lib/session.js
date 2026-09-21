import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "../config/env.js";
import { pgPool } from "./pgPool.js";

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
	store: new PgSession({
		pool: pgPool,
		tableName: "user_sessions",
		createTableIfMissing: true,
	}),
	secret: env.sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
});
