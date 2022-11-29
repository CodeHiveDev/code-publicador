import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getEnvPath } from 'src/common/utils/get-env-path';

const path = getEnvPath(`${__dirname}/src/config/envs`);

config({ path });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.PGPASSWORD,
  database: process.env.POSTGRES_DB,
  migrations: ['./src/database/migrations/*.ts'],
  migrationsTransactionMode: 'each',
});
