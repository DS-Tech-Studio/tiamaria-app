import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga las variables de entorno desde .env

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tiamaria_db',
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Debe estar en false para usar migraciones
});