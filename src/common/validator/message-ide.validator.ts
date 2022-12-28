import { IsDefined, IsIn, IsOptional, IsString } from 'class-validator';
import { IMessageIDE } from '../interfaces/message-ide.interface';

export class MessageIDE implements IMessageIDE {
  constructor(opts: unknown) {
    Object.assign(this, opts);
  }
  @IsString()
  @IsIn(['raster', 'vectorial'])
  layerType: 'raster' | 'vectorial';

  @IsOptional()
  @IsString()
  workspace?: string;

  @IsString()
  datastore: string;

  @IsString()
  layerName: string;

  @IsString()
  @IsIn(['CM', 'PS', 'CA'])
  datasource: 'CM' | 'PS' | 'CA';

  @IsOptional()
  @IsDefined()
  timeDimension?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
