// database/database.service.ts

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  pool!: mysql.Pool; // Assures TypeScript it will be initialized

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'mysql-3b854787-ncf-7115.d.aivencloud.com',
      port: +(process.env.DB_PORT || 20615),
      user: process.env.DB_USER || 'avnadmin',
      password: process.env.DB_PASSWORD || 'UseYourAivenDBPassword',
      database: process.env.DB_NAME || 'defaultdb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool created');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }
}