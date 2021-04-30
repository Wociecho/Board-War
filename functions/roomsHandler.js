const rooms = [];

function findRoom(){
    let returnId = rooms.findIndex(room => room.players < 2);
    if(returnId === -1){
        rooms.push({
            id: rooms.length,
            players: 0,
            p1Name: '',
            p1Id: '',
            p2Name: '',
            p2Id: '',
            started: false,
            onMove: '',
            board: ["WT", "WP", "WH", "WG", "WH", "WP", "WT",
            "WS", "WS", "WS", "WS", "WS", "WS", "WS",
            "E", "E", "E", "E", "E", "E", "E",
            "E", "E", "E", "E", "E", "E", "E",
            "E", "E", "E", "E", "E", "E", "E",
            "BS", "BS", "BS", "BS", "BS", "BS", "BS",
            "BT", "BP", "BH", "BG", "BH", "BP", "BT"],
            selectedPiece: '',
            counter: '',
            time: 30,
            wLimit: 6,
            bLimit: 6
        });
        returnId = rooms.findIndex(room => room.players < 2);
    }

    rooms[returnId].players++;

    return returnId;
}

function isTwoPlayers(roomId){
    return rooms[roomId].players === 2 ? true : false;
}

export { findRoom, isTwoPlayers, rooms };