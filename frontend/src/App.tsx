import React, {FC, useEffect, useState} from 'react';
import './App.css';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';

interface ILotSpaceInfo {
    lotName: string;
    lots: number[];
}

interface ILotInformation {
    lotInfo: ILotSpaceInfo,
    parkData: any
}

const numberToDay = (n: number) => {
    switch (n) {
        case 0: return "SUN";
        case 1: return "MON";
        case 2: return "TUE";
        case 3: return "WED";
        case 4: return "THU";
        case 5: return "FRI";
        case 6: return "SAT";
    }
};

const LotInformation: FC<ILotInformation> = (props) => {
    const {lotName, lots} = props.lotInfo;
    const parkData= props.parkData;
    console.log(parkData)

    const occupancyInfo = parkData.filter((e: any)=>e.identifier === lotName)
    return (
        <div className={"outlined"}>
            <h2  id={"lotHeading"}>{lotName}</h2>
            <div className={"centered"}>
                {lots.map((lot, index) => lot === 1 ? <OccupiedLot number={index} key={index}/> : <EmptyLot number={index} key={index}/>)}
                <div style={{display: "flex"}}>
                    {

                        lots.map((lot, index)=>{
                            const data: any[] = [];
                            console.log(occupancyInfo)
                            if (occupancyInfo.length <= 0) {
                                return <span></span>
                            } else {
                                // eslint-disable-next-line no-unused-expressions
                                const percentages = occupancyInfo.filter((e: any)=>e.lotNumber === index).pop().percentages;
                                percentages.map((d: any, index: number)=>data.push({name: numberToDay(index), uv: d}));
                                return (
                                    <span>
                                        Occupancy percentage lot {index}
                                        <LineChart width={400} height={150} data={data}>
                                            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                                            <CartesianGrid stroke="#ccc" />
                                            <XAxis dataKey="name" />
                                            <YAxis/>
                                            <Tooltip/>
                                        </LineChart>
                                    </span>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
};

const EmptyLot: FC<{number: number}> = (props) => (<span className={"lot empty"}>{props.number}</span>);
const OccupiedLot: FC<{number: number}> = (props) => (<span className={"lot occupied"}>{props.number}</span>);

const App: React.FC = () => {
    const [lotSpaceInfo, setLotSpaceInfo] = useState<ILotSpaceInfo[]>();
    const [parkData, setParkData]=useState<any>([]);

    useEffect(()=>{
        new WebSocket(`ws://${window.location.hostname}:8081/ws`)
            .onmessage = ((msg)=>{setLotSpaceInfo(JSON.parse(msg.data))});
        fetch("http://localhost:8080/parking").then(async (res)=>{
          const data = await res.json();
          setParkData(data);
        })
    }, []);

    return (
        <div className="app">
            {lotSpaceInfo?.map((lot, index)=> (
                <LotInformation lotInfo={lot} key={index} parkData={parkData}/>
            ))}

        </div>
    );
};

export default App;
