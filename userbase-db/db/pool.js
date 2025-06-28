//TODO: ПЕРЕНЕСТИ В ENVIRONMENT VARIABLES!

import { Pool } from "pg";

// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
const pool = new Pool({
    connectionString:
        "postgresql://postgres:pedya@85.209.132.162:5433/postgres"
});

export default pool;
