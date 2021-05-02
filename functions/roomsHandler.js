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
            time: '',
            wLimit: 6,
            bLimit: 6
        });
        returnId = rooms.findIndex(room => room.players < 2);
    }

    return returnId;
}

function isTwoPlayers(roomId){
    return rooms[roomId].players === 2 ? true : false;
}

function checkIfPlayerAlreadyInGame(username, nameOrId){
    let foundIndex = undefined;
    switch(nameOrId) {
        case 'name':
            rooms.some((room, index) => {
                if(room.p1Name === username || room.p2Name === username){
                    foundIndex = index;
                    return true;
                }
            });
            break;
        case 'id':
            rooms.some((room, index) => {
                if(room.p1Id === username || room.p2Id === username){
                    foundIndex = index;
                    return true;
                }
            });
            break;
        default:
            break;
    }
    return foundIndex;
}

function resetRoom(roomId) {
    rooms[roomId] = {
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
        time: '',
        wLimit: 6,
        bLimit: 6
    };
}

export { findRoom, isTwoPlayers, checkIfPlayerAlreadyInGame, resetRoom, rooms };