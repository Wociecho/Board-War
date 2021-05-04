const rooms = [];
let roomCounter = 0;
const defaultBoard = ["WT", "WP", "WH", "WG", "WH", "WP", "WT",
"WS", "WS", "WS", "WS", "WS", "WS", "WS",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"BS", "BS", "BS", "BS", "BS", "BS", "BS",
"BT", "BP", "BH", "BG", "BH", "BP", "BT"];
const emptyRoom = {
    players: 0,
    p1Name: '',
    p1Id: '',
    p2Name: '',
    p2Id: '',
    started: false,
    onMove: '',
    selectedPiece: '',
    counter: '',
    time: '',
    wLimit: 6,
    bLimit: 6
};

function findRoom(){
    let emptyRoomIndex = rooms.findIndex(room => room.players < 2);
    if(emptyRoomIndex === -1){
        const defaultRoom = Object.assign({}, emptyRoom);
        defaultRoom.board = Object.assign([], defaultBoard);
        defaultRoom.no = roomCounter;
        roomCounter++;
        rooms.push(defaultRoom);
        emptyRoomIndex = rooms.findIndex(room => room.players < 2);
    }
    return rooms[emptyRoomIndex].no;
}

function isTwoPlayers(room){
    return room.players === 2 ? true : false;
}

function checkIfPlayerAlreadyInGame(username){
    let foundRoomNo = undefined;
        rooms.some(room => {
            if(room.p1Name === username || room.p2Name === username){
                foundRoomNo = room.no;
                return true;
            }
        });
    return foundRoomNo;
}

function deleteRoom(room) {
    rooms.splice(room, 1);
}

export { findRoom, isTwoPlayers, checkIfPlayerAlreadyInGame, deleteRoom, rooms };