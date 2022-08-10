export default () => ({
    port: parseInt(process.env.PORT) || 5000,
    QueueService: {
        QUEUE : process.env.QUEUE,
        QUEUE_URL : process.env.QUEUE_URL,
        AWS_REGION :  process.env.AWS_REGION,
        ACCESS_KEY_ID : process.env.ACCESS_KEY_ID,
        SECRET_ACCESS_KEY : process.env.SECRET_ACCESS_KEY,
    }
  });