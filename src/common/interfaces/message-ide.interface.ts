export interface IMessageIDE {
  layerType: 'raster' | 'vectorial';
  workspace?: string;
  datastore: string;
  layerName: string;
  datasource: 'CM' | 'PS' | 'CA';
  timeDimension?: any;
  style?: string;
  path: string;
  fileName?: string;
}
