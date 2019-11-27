import Express from "express";
import bodyParser = require("body-parser");
import {ParkingLot} from "./parkingLot";
const cors = require("cors");

interface ILotSpaceInfo {
    lotName: string;
    lots: number[];
}

const app = Express();

app.use(cors());
app.use(bodyParser());
app.use(Express.static('public'))

const lots: ParkingLot[] = [];

// Define lots and their API keys here
lots.push(new ParkingLot("University parking lot", "35801a20-1113-11ea-ac4c-a5718f95e0de"));
lots.push(new ParkingLot("Weissmann lot",  "35801a20-1113-11ea-ac4c-lolololo"));


const getFreeSpaces = (): ILotSpaceInfo[] => {
    const lotInfo: ILotSpaceInfo[] = [];
    lots.map(lot => {
        lotInfo.push({
            lotName: lot.getIdentifier(),
            lots: lot.getAvailableSpace()
        })
    });

    return lotInfo
};

app.post("/lots/:apikey", (req, res) => {
    const apikey = req.params["apikey"];

    try {
        const selectedLot = lots.filter(lot=>lot.getApiKey() == apikey);
        if (selectedLot.length <= 0) {throw("INVALID API KEY")}
        const newLotInfo: number[] = req.body;
        console.log(newLotInfo);
        selectedLot[0].setAvailableSpace(newLotInfo);
        res.send("OK")
    } catch (e) {
        res.send(e);
        res.status(400);
    }
});

app.get("/lots", (req, res) => {
    res.send(getFreeSpaces());
});

app.listen(8080);

/*
app.get("/lots/:identifier", (req, res) => {
    const identifier = req.params["identifier"];

    if (identifier != null) {
        let availableSpace: number[] = [];
        lots.map((lot , index)=> {
            if (lot.getIdentifier() == identifier){
                availableSpace = lots[index].getAvailableSpace();
            }
        });

        if (availableSpace.length <= 0) {
            res.status(400);
            res.send("INVALID IDENTIFIER")
        } else {
            res.send(availableSpace)
        }
    } else {
        res.send("IDENTIFIER NOT SPECIFIED")
        res.status(400);
    }
});

app.put("/lots/:identifier", (req, res) => {
    const identifier = req.params["identifier"];

    if (identifier != null) {
        const ip = req.ip;
        const invalidIdentifier: boolean = (lots.map(lot => lot.getIdentifier() == identifier)).includes(true);
        const invalidUri: boolean = (lots.map(lot => lot.getUri() == ip)).includes(true);

        if (!(invalidIdentifier || invalidUri)) {
            lots.push(new ParkingLot(identifier, ip));
            res.send(lots.pop()?.getApiKey());
        } else {
            res.status(409);
            res.send("DUPLICATE ADDRESS OR IDENTIFIER")
        }
    } else {
        res.send("IDENTIFIER NOT SPECIFIED");
        res.status(400);
    }
});

app.delete("/lots/:identifier", (req, res) => {
    const identifier = req.params["identifier"];

    if (identifier != null) {
        let deleted: boolean = false;
        (lots.map((lot, index)=> {
            if (lot.getIdentifier() === identifier) {
                lots.splice(index);
                deleted = true;
            }
        }));

        deleted ? res.send(`DELETED [${identifier}] LOT`) : res.send(`[${identifier}] DOES NOT EXIST`);
    } else {
        res.send("IDENTIFIER NOT SPECIFIED")
        res.status(400);
    }
});
*/

