import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  pool!: mysql.Pool;

  async onModuleInit() {
    // Validate that required database environment variables are present
    const missingVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(
      (v) => !process.env[v],
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required database environment variables: ${missingVars.join(', ')}. Please check your Render environment settings.`,
      );
    }

    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false },
    });

    // Test the pool connection
    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool created successfully');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool() {
    return this.pool;
  }
}

console.log('DEBUG CONFIG -->', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER ? 'EXISTS (length: ' + process.env.DB_USER.length + ')' : 'MISSING/UNDEFINED',
  database: process.env.DB_NAME,
});