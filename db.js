import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
});

async function query(sql) {
    const [results, fields] = await connection.execute(sql);
    console.log("Resultados da consulta:", results);

    return results;
}

export { query };