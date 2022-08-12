export default () => ({
  geoserverService: {
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_AUTH: process.env.SERVER_AUTH,
    SERVER_USER: process.env.SERVER_USER,
    SERVER_PASSWORD: process.env.SERVER_PASSWORD,
  },
});
