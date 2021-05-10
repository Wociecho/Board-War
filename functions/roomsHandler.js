const rooms = [];
const defaultBoard = ["WT", "WP", "WH", "WG", "WH", "WP", "WT",
"WS", "WS", "WS", "WS", "WS", "WS", "WS",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"BS", "BS", "BS", "BS", "BS", "BS", "BS",
"BT", "BP", "BH", "BG", "BH", "BP", "BT"];
const defaultRoom = {
    players: 0,
    p1Name: '',
    p1Id: '',
    p2Name: '',
    p2Id: '',
    started: false,
    ended: false,
    onMove: '',
    selectedPiece: '',
    counter: '',
    time: '',
    wLimit: 6,
    bLimit: 6,
    request: '',
    expectedAnswerFrom: ''
};
let roomCounter = 0;

function findRoom(){
    let roomToJoin = rooms.findIndex(room => room.players < 2);
    if(roomToJoin === -1){
        const emptyRoom = Object.assign({}, defaultRoom);
        emptyRoom.board = Object.assign([], defaultBoard);
        emptyRoom.no = roomCounter;
        roomCounter++;
        rooms.push(emptyRoom);
        roomToJoin = rooms.findIndex(room => room.players < 2);
    }
    return rooms[roomToJoin].no;
}

function checkIfPlayerInGame(username){
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

export { findRoom, checkIfPlayerInGame, deleteRoom, rooms };