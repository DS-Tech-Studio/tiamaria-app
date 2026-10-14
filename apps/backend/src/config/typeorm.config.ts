import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga las variables de entorno desde .env

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env[isProduction ? 'DB_PROD_HOST' : 'DB_HOST'] || 'localhost',
  port: parseInt(
    process.env[isProduction ? 'DB_PROD_PORT' : 'DB_PORT'] || '5432',
    10,
  ),
  username:
    process.env[isProduction ? 'DB_PROD_USERNAME' : 'DB_USERNAME'] ||
    'postgres',
  password:
    process.env[isProduction ? 'DB_PROD_PASSWORD' : 'DB_PASSWORD'] || '',
  database:
    process.env[isProduction ? 'DB_PROD_NAME' : 'DB_NAME'] || 'tiamaria_db',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Debe estar en false para usar migraciones
});