import Express from "express";
import bodyParser = require("body-parser");
import {lots, MONGO_ENABLED, port} from "./config";
import {ILotSpaceInfo} from "./parkingLot"
import WebSocket from "ws";
import {MongoController} from "./mongoController";
import {mongoController} from "./global";
import {evaluateParkingData} from "./eval";
import {generateParkingData} from "./generator";
const cors = require("cors");


const app = Express();

const wss = new WebSocket.Server({port: 8081, path: "/ws"}, ()=>{
    console.log("Websocket server started on port 8081 endpoint /ws")
});

wss.on("connection", (connection)=>{
    console.log("New websocket connection!")
    connection.send(JSON.stringify(getFreeSpaces()));
});

app.use(cors());
app.use(bodyParser());
app.use(Express.static('public'))
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

if (MONGO_ENABLED) {
    mongoController.connectMongo();

    app.get("/parking", async (req, res) => {
        res.send(await mongoController.getProcessedParkingData());
    });

    app.get("/parking/evaluate", async (req, res) => {
        await evaluateParkingData();
        res.send("OK");
    });
}

app.get("/parking/generate", async (req, res) => {
    await generateParkingData();
    res.send("OK");
});


app.post("/lots/:apikey", (req, res) => {
    const apikey = req.params["apikey"];

    try {
        const selectedLot = lots.filter(lot=>lot.getApiKey() == apikey);
        if (selectedLot.length <= 0) {throw("INVALID API KEY")}
        const newLotInfo: number[] = req.body;
        console.log(`${selectedLot[0].getIdentifier()}: ${newLotInfo}`);
        selectedLot[0].setAvailableSpace(newLotInfo);
        res.send("OK")
    } catch (e) {
        res.send(e);
        res.status(400);
    }

    const freeSpace = getFreeSpaces();
    wss.clients.forEach((client)=> {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(freeSpace));
        }
    })
});

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`)
});
