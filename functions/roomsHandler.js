const rooms = [{
    id: 0,
    players: 0
}];

function findRoom(){
    let returnId = rooms.findIndex(room => room.players < 2);
    if(returnId === -1){
        rooms.push({
            id: rooms.length,
            players: 0
        });
        returnId = rooms.findIndex(room => room.players < 2);
    }

    rooms[returnId].players++;

    return returnId;
}

function isTwoPlayers(roomId){
    return rooms[roomId].players === 2 ? true : false;
}

export { findRoom, isTwoPlayers };