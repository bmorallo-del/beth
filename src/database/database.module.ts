import { Module, Global } from '@nestjs/common';
import { createPool } from 'mysql2/promise';
// (or whatever imports you have for your config/pool)

@Global() // Optional, but makes DatabaseModule available everywhere if you want
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        return createPool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: { rejectUnauthorized: false }, // Often needed for cloud DBs like Aiven
        });
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'], // <--- THIS LINE IS CRITICAL
})
export class DatabaseModule {}