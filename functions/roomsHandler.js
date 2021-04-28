import { board } from './boardStatus.js';

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
            onMove: 'white',
            board: board
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