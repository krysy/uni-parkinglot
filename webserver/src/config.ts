import { ParkingLot } from "./parkingLot";

export const lots: ParkingLot[] = [];
export const port = 8080;

// Define lots and their API keys here
lots.push(new ParkingLot("University parking lot", "35801a20-1113-11ea-ac4c-a5718f95e0de"));
lots.push(new ParkingLot("Weissmann lot",  "35801a20-1113-11ea-ac4c-lolololo"));

