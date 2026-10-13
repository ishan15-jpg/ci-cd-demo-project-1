import { Pool } from "pg";
import AWS from "aws-sdk"
import { readFileSync } from "fs";
AWS.config.update({ region: process.env['AWS_REGION'] });

const pool = new Pool({
    connectionString: process.env['DATABASE_URL'],
    ssl: { 
        ca: readFileSync('./certs/global-bundle.pem').toString()
    }
});

async function connectDB() {
    try {
        await pool.connect();
        const res = await pool.query('SELECT version()');
        console.log(res.rows[0].version);
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

export { pool, connectDB }