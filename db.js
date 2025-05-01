import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function query(sql) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME,
    });
    const [results] = await connection.execute(sql);

    await connection.end();

    return results;
}

export { query };