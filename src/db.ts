import { Pool } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";

const pool = new Pool({
    connectionString: process.env['DATABASE_URL'],
    ssl: process.env['NODE_ENV'] == "prod" || process.env['NODE_ENV'] == "staging"
    ? { 
        ca: readFileSync("./certs/global-bundle.pem")
    } 
    : false
});

export default pool;