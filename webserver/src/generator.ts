import {lots} from "./config";
import {mongoController} from "./global";

export interface IEntry {
    identifier: string;
    lotNumber: number;
    startTime: number;
    endTime: number;
    duration: number;
}

let dataStorage: IEntry[] = [];

const startDate = "2019-01-01 00:00";
const daysToGenerate = 365;

const random = (max: number) => (Math.floor(Math.random() * max));

const generateDay = (identifier: string, lotCount: number, date: Date) => {
    const parkingChances = [
        [0, 12, 12, 12, 12, 13, 10, 9, 9, 10, 12, 12, 10, 9, 9, 7, 9, 13, 12, 12, 12, 11, 12, 0], // Sunday
        [0, 11, 12, 9, 9, 7, 13, 2, 2, 3, 2, 6, 8, 8, 7, 4, 3, 5, 9, 8, 8, 9, 10, 0], // Monday
        [0, 13, 13, 10, 10, 6, 3, 2, 3, 3, 4, 7, 8, 8, 3, 3, 4, 5, 7, 8, 8, 9, 11, 0], // Tuesday
        [0, 10, 12, 11, 11, 4, 3, 2, 4, 3, 2, 8, 8, 8, 3, 4, 4, 5, 9, 8, 8, 9, 12, 0], // Wednesday
        [0, 12, 11, 9, 9, 6, 13, 2, 4, 4, 3, 6, 8, 8, 3, 4, 3, 5, 9, 8, 8, 9, 12, 0], // Thursday
        [0, 11, 10, 10, 10, 6, 3, 2, 3, 3, 4, 8, 7, 8, 3, 3, 4, 5, 10, 8, 9, 12, 12, 0], // Friday
        [0, 12, 12, 12, 12, 13, 10, 6, 6, 5, 6, 5, 8, 9, 9, 7, 9, 13, 12, 12, 12, 11, 12, 0], // Saturday
    ];

    const entriesToReturn: IEntry[] = [];
    const tempEntryStorage: IEntry[] = [];
    const occupancy: boolean[] = [];

    const currentParkingChance = parkingChances[date.getDay()];
    currentParkingChance.map((chance, hour)=> {
        date.setHours(hour);
        for (let lot = 0; lot < lotCount; lot++){
            if (chance >= random(15)){
                if (!occupancy[lot]) {
                    tempEntryStorage[lot] = {
                        identifier,
                        lotNumber: lot,
                        startTime: date.getTime(),
                        endTime: 0,
                        duration: 0
                    };
                    occupancy[lot] = true;
                }
            } else {
                const occupancyEntry = tempEntryStorage[lot];
                if (occupancyEntry?.duration == 0 ){
                    occupancyEntry.endTime = date.getTime();
                    occupancyEntry.duration = occupancyEntry.endTime - occupancyEntry.startTime;
                    occupancy[lot]=false;
                    entriesToReturn.push(occupancyEntry);
                }
            }
        }
    });


    return entriesToReturn;
};

export const generateParkingData = async () => {
    const date = new Date(startDate);
    const uploadParkingData = async () => {
      await mongoController.setParkingData(dataStorage);
    };

    lots.map(lot => {
        for (let day = 0; day < 365; day++) {
            dataStorage = [...dataStorage, ...generateDay(lot.getIdentifier(), 2, date)];
            date.setDate(date.getDate() + 1);
        }
    });
    await uploadParkingData();
};
//require("fs").writeFile("generated.json", JSON.stringify(dataStorage), ()=>{})
