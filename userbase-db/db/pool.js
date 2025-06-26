//TODO: ПЕРЕНЕСТИ В ENVIRONMENT VARIABLES!

import { Pool } from "pg";

// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
const pool = new Pool({
    connectionString:
        "postgresql://postgres:pedya@localhost:5433/users",
});

export default pool;
