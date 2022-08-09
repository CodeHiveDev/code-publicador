export const supportedVectorFormats = [
  {
    id: 'shapefile',
    name: 'ESRI Shapefile',
    required: ['shp', 'shx', 'dbf', 'prj'],
    optional: [
      'sld',
      'qml',
      'sbn',
      'sbx',
      'fbn',
      'fbx',
      'ain',
      'aih',
      'ixs',
      'mxs',
      'atx',
      'shp.xml',
      'cpg',
      'qix',
    ],
  },
];
