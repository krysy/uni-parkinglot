const uuidv1 = require('uuid/v1');

export class ParkingLot {
    private readonly identifier: string;
    private readonly apiKey: string;
    private spaces: number[];

    public constructor(identifier: string, apikey?: string) {
        this.identifier = identifier;
        this.spaces = [0,0];
        this.apiKey = apikey != undefined ? apikey : uuidv1();
    }



    getApiKey(): string {
        return this.apiKey;
    }

    getIdentifier(): string {
        return this.identifier;
    }


    setAvailableSpace(spaces: number[]) {
        this.spaces = spaces;
    }

    getAvailableSpace(): number[] {
        return this.spaces;
    }
}
