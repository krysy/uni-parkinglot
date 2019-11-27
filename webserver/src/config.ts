interface IConfig {
    parkingLots: {
        identifier: string,
        uri: string,
        parkingSpaces: number
    }[]
}

export const config: IConfig = {
    parkingLots: [
        {
            identifier: "PARKING_LOT_01",
            uri: "http://foofbarafa.com",
            parkingSpaces: 4
        },
        {
            identifier: "PARKING_LOT_02",
            uri: "http://foafaf.com",
            parkingSpaces: 2
        }
    ]
};
