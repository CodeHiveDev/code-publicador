export const metadataTimeDimension = (timeDimension: string) => ({
  entry: [
    {
      '@key': 'elevation',
      dimensionInfo: {
        enabled: false,
      },
    },
    {
      '@key': 'time',
      dimensionInfo: {
        enabled: true,
        attribute: timeDimension,
        presentation: 'CONTINUOUS_INTERVAL',
        units: 'ISO8601',
        defaultValue: {
          strategy: 'MAXIMUM',
        },
        nearestMatchEnabled: false,
        rawNearestMatchEnabled: false,
      },
    },
  ],
});
