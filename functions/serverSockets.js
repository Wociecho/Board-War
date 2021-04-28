import { rooms, isTwoPlayers } from './roomsHandler.js';
import { findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        console.log('connected');
        socket.on('player join', (roomId, username) => {
            socket.username = username;
            
            rooms[roomId].p1Name === "" ?
            (rooms[roomId].p1Name = username,
            rooms[roomId].p1Id = socket.id) :
            (rooms[roomId].p2Name = username,
            rooms[roomId].p2Id = socket.id);
            
            isTwoPlayers(roomId) ?
            io.of('/game' + roomId).emit('start game') :
            io.of('/game' + roomId).emit('wait');
        });

        socket.on('send nickname', (username, roomId) => {
            io.of('/game' + roomId).emit('set board', username, rooms[roomId].board, rooms[roomId].p1Name);
            console.log(rooms[roomId].started);
            if(!rooms[roomId].started) {
                rooms[roomId].started = true;
                io.of('/game' + roomId).to(rooms[roomId].p1Id).emit('start turn');
            }
        });

        socket.on('find moves request', (roomId, unitId) => {
            let res = [];
            let color;
            if(rooms[roomId].p1Id === socket.id) color = "W";
            if(rooms[roomId].p2Id === socket.id) color = "B";

            rooms[roomId].board[unitId-1].match(color)?.length > 0 ?
            res = findPossibleMovesAndTargets(roomId, unitId) :
            res = [];

            io.of('/game' + roomId).to(socket.id).emit('find move response', res);
        });
    });
}

export { sockets };