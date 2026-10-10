import "dotenv/config";
import app from "./app.js";
import { createServer } from "http";
import pool from "./db.js";

const server = createServer(app);

const connectToDb = async () => {
  try {
    await pool.connect();
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

connectToDb()

const port = Number(process.env.PORT ?? "3000");

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("PORT must be an integer between 0 and 65535");
}

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});