import { MongoClient } from "mongodb";
import {IProcessedPercentages} from "./eval";
import {IEntry} from "./generator";

export class MongoController {
    private conn: MongoClient;
    constructor(url: string){
        this.conn = new MongoClient(url, {useUnifiedTopology: true});
    }

    async connectMongo(){
        return new Promise((resolve, reject) => {
            this.conn.connect((err, res)=>{
                if (err) {reject(err)}
                this.conn.db("uni").collection("parking");
                resolve(res);
            })
        })
    }

    public setParkingData(data : IEntry[]) {
        return new Promise(async (resolve)=>{
            const uploadData = () => this.conn.db("uni").collection("parking").insertMany(data, {},() => {resolve(true)});

            this.conn.db("uni").collection("parking").drop().then(()=>{
                uploadData();
            }).catch(()=>{
               uploadData();
            });
        })
    }

    public insertParkingData(data: IEntry) {
        return new Promise(async (resolve) => {
            resolve((await (this.conn.db("uni").collection("parking").insertOne(data, {}, ()=>resolve(true)))));
        });
    }

    public setProcessedParkingData(data : IProcessedPercentages[]) {
        return new Promise(async (resolve)=>{
            const uploadData = () => this.conn.db("uni").collection("processedParkingData").insertMany(data, {},() => {resolve(true)});

            this.conn.db("uni").collection("processedParkingData").drop().then(()=>{
                uploadData();
            }).catch(()=>{
                uploadData();
            });
        })
    }

    public getParkingData(): Promise<IEntry[]> {
        return new Promise(async (resolve) => {
            resolve((await (this.conn.db("uni").collection("parking").find().toArray())));
        });
    }

    public getProcessedParkingData(): Promise<IEntry[]> {
        return new Promise(async (resolve) => {
            resolve((await (this.conn.db("uni").collection("processedParkingData").find().toArray())));
        });
    }
}
