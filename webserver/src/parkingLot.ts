import {mongoController} from "./global";
import {MONGO_ENABLED} from "./config";

const uuidv1 = require('uuid/v1');

export interface ILotSpaceInfo {
    lotName: string;
    lots: number[];
}

export class ParkingLot {
    private readonly identifier: string;
    private readonly apiKey: string;
    private spaces: number[];
    private parkingTimes: number[];

    public constructor(identifier: string, apikey?: string) {
        this.identifier = identifier;
        this.spaces = [0,0];
        this.parkingTimes = [];
        this.apiKey = apikey != undefined ? apikey : uuidv1();
    }

    private setParkingStart(index: number) {

    }

    private getParkingTime(index: number) {

    }

    getApiKey(): string {
        return this.apiKey;
    }

    getIdentifier(): string {
        return this.identifier;
    }


    setAvailableSpace(spaces: number[]) {
        this.spaces = spaces;
        spaces.forEach((space, index) => {
            if (space == 1) {
                if (isNaN(this.parkingTimes[index])) {
                    this.parkingTimes[index] = Date.now();
                }
            } else {
                if (!isNaN(this.parkingTimes[index])) {
                    const parkingTime = Date.now()-this.parkingTimes[index];
                    console.log(`[${this.getIdentifier()}(${index})] Start: ${new Date(this.parkingTimes[index]).toLocaleString()} End: ${new Date().toLocaleString()} Parking duration: ${parkingTime}ms`);

                    if (MONGO_ENABLED) {
                        mongoController.insertParkingData({identifier: this.getIdentifier(), lotNumber: index, startTime: this.parkingTimes[index], endTime: new Date().getDate(), duration: parkingTime});
                    }
                }
                this.parkingTimes[index] = NaN;
            }
        })
    }

    getAvailableSpace(): number[] {
        return this.spaces;
    }
}
