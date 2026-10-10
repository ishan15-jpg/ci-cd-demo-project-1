import express from "express";
import pool from "./db.js";

const app = express();

app.get('/health', (_,res) => {
  res.status(200).json({
    message: "Healthy"
  })
})

app.get('/users', async (_,res) => {
  try{
    const result = await pool.query('SELECT * FROM users;');
    res.status(200).json({
      rows: result.rows
    })
  }catch(e: any){
    res.status(500).send(e.message)
  }
})

app.get('/emails', async (_,res) => {
  try{
    const result = await pool.query('SELECT name, email FROM users;');
    res.status(200).json({
      rows: result.rows
    })
  }catch(e: any){
    res.status(500).send(e.message)
  }
})

export default app;