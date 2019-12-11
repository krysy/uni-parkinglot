import fs from "fs";
import {IEntry} from "./generator";
import {mongoController} from "./global";

interface IStore {
    [identifier: string]: {
        [lot: number]: {
            [day: number]: {
                sum: number;
                entryCount: number;
                percentage?: number;
            }
        }
    }
}

export interface IProcessedPercentages {
    identifier: string,
    lotNumber: number;
    percentages: number[]
}[];

const loadJson = (): Promise<IEntry[]> => {
    return new Promise((resolve)=>{
        fs.readFile("generated.json", {encoding: 'utf-8'}, (err, data)=> {
           resolve(JSON.parse(data));
        });
    })
};

export  const evaluateParkingData = async () => {
    // const data = await loadJson();
    const data = await mongoController.getParkingData();

    const identifiers = Array.from(new Set(data.map(entry => entry.identifier)));
    const lotNumbers = Array.from(new Set(data.map(entry => entry.lotNumber))).sort();
    const store: IStore = {};
    const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;

    // separate every entry intro identifier->lot->day relationship
    identifiers.map(identifier => {
        store[identifier] = {}; // init empty object
        const entriesSeparatedByIdentifier = data.filter(entry => entry.identifier === identifier);
        lotNumbers.map((ln) => {
            store[identifier][ln] = {}; // init empty object
            const lotEntries = entriesSeparatedByIdentifier.filter(entry => entry.lotNumber == ln);
            for (let day = 0; day < 7; day++) {
                const dayEntries = lotEntries.filter(entry=> (new Date(entry.startTime).getDay() == day))
                    .map((entry => entry.duration));
                const sum = dayEntries.reduce(reducer);
                store[identifier][ln][day] = { sum, entryCount: dayEntries.length };
            }
        });
    });

    const processed: IProcessedPercentages[] = [];

    // get the percentage of occupancy
    identifiers.map((identifier)=> {
        lotNumbers.map((ln)=>{
            const lotEntry = store[identifier][ln];
            const msInDay = 86400000;
            const percentages: number[] = [];
            Object.keys(lotEntry).map((key: any) => {
               const stayMs = lotEntry[key].sum / lotEntry[key].entryCount;
               const percentage = ((stayMs / msInDay) *  100);
               lotEntry[key].percentage = percentage;
                percentages.push(percentage);
            });

            processed.push({identifier, lotNumber: ln, percentages})
        })
    });

    await mongoController.setProcessedParkingData(processed);
    //console.log(processed)
};
