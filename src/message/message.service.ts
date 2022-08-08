import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { RasterService } from '../raster/raster.service';
import { ShapefilesService } from '../shapefiles/shapefiles.service';

@Injectable()
export class MessageService {
    constructor(
        @Inject(forwardRef(() => ShapefilesService))
        private shapefilesService: ShapefilesService,
        @Inject(forwardRef(() => RasterService))
        private rasterService: RasterService,
    ) { }
    @SqsMessageHandler("invap-ho-event-queue-test", false)
    //receiveMessage visibilitytimeoout waittime atributes all buscar sequence number deletemessage reciep handle 
    public async MessageHandler(message: AWS.SQS.Message) {
        let sms:any = {};

        // read attributes
        message.MessageAttributes && Object.keys(message.MessageAttributes).forEach(attribute => {
            if (message.MessageAttributes[attribute].DataType === "String") {
                sms[attribute] = message.MessageAttributes[attribute].StringValue;
            } else if (message.MessageAttributes[attribute].DataType === "Number") {
                sms[attribute] = +message.MessageAttributes[attribute].StringValue;
            } else if (message.MessageAttributes[attribute].DataType === "Boolean") {
                sms[attribute] = message.MessageAttributes[attribute].StringValue[0].toLowerCase() === "t";
            }
        });
        
        // delete message

        // services raster or shapefile
        const Objectfile = '' //await this.getRasterObject(sms.folder, sms.filename, sms.type)
        const pathandfile = sms.folder+sms.filename+'.'+sms.type

        // Traer todos los archivos de esa extension
        if (sms.type === 'shp') this.shapefilesService.shapeHandler(Objectfile, pathandfile, sms.folder, sms.filename,'Geometry')
        if (sms.type === 'tiff') this.rasterService.rasterHandler(Objectfile, pathandfile, sms.folder, sms.filename,'GeoTIFF' )
        
    }
    getRasterObject(folder, filename, type){
        var s3 = new AWS.S3
        ({
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        });
        var params = {
            Bucket: 'ho-backend-content-dev', 
            Key:  folder+filename+'.'+type //message.Body //'publicador/sat.tif',
        }
        console.log("param", params)
        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data)=> {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    reject(err.message);
                }else{
                    // successful response
                    console.log(data);  
                    resolve(data);
                }    
            })
        })
    }
}
