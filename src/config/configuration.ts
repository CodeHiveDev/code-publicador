import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  baseUrl: process.env.BASE_URL,
  queue: process.env.QUEUE,
  queueUrl: process.env.QUEUE_URL,
  awsRegion: process.env.AWS_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  postgresPort: process.env.POSTGRES_PORT,
  postgresHost: process.env.POSTGRES_HOST,
  postgresUser: process.env.POSTGRES_USER,
  postgresDb: process.env.POSTGRES_DB,
  pgPassword: process.env.PGPASSWORD,
  serverHost: process.env.SERVER_HOST,
  serverUser: process.env.SERVER_USER,
  serverPassword: process.env.SERVER_PASSWORD,
  bucketName: process.env.BUCKETNAME,
  workspace: process.env.WORKSPACE,
  store: process.env.STORE,
}));
