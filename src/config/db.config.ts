export default () => ({
    postgisService: {
        POSTGRES_PORT : process.env.POSTGRES_PORT,
        POSTGRES_HOST : process.env.POSTGRES_HOST,
        POSTGRES_USER :  process.env.POSTGRES_USER,
        POSTGRES_DB : process.env.POSTGRES_DB,
        PGPASSWORD : process.env.PGPASSWORD,
    }
  });