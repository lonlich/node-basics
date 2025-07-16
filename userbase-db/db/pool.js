import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// All of the following properties should be read from environment variables

const pool = new Pool({
    connectionString:
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

export default pool;

