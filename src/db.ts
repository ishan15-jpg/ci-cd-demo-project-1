import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env['DATABASE_URL'],
    ssl: process.env['NODE_ENV'] == "prod" || process.env['NODE_ENV'] 
    ? { rejectUnauthorized: false } 
    : false
});

export default pool;