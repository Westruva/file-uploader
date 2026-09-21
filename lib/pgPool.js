import pg from "pg";
import { env } from "../config/env.js";

export const pgPool = new pg.Pool({ connectionString: env.databaseUrl });
