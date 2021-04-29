import { rooms, isTwoPlayers } from './roomsHandler.js';
import { findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {

        console.log('connected');
        socket.on('player join', (username) => {
            const roomId = Number(socket.nsp.name.replace('/game', ''));
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

        socket.on('send nickname', (username) => {
            const roomId = Number(socket.nsp.name.replace('/game', ''));
            io.of('/game' + roomId).emit('set board', username, rooms[roomId].board, rooms[roomId].p1Name);
            if(!rooms[roomId].started) {
                rooms[roomId].started = true;
                io.of('/game' + roomId).to(rooms[roomId].p1Id).emit('start turn');
            }
        });

        socket.on('find moves request', (unitId) => {
            const roomId = Number(socket.nsp.name.replace('/game', ''));
            if(unitId >=1 && unitId <=49){
                let res = [];
                let color, oppositeColor;
                
                if(rooms[roomId].p1Id === socket.id) { color = "W"; oppositeColor = "B" }
                if(rooms[roomId].p2Id === socket.id) { color = "B"; oppositeColor = "W" }

                rooms[roomId].board[unitId-1].match(color) ?
                res = findPossibleMovesAndTargets(roomId, unitId) :
                res = [];

                if(res.length > 0){
                    res[0] = res[0].filter(fieldId => !rooms[roomId].board[fieldId-1].match(color));
                    res[1] = res[1].filter(fieldId => rooms[roomId].board[fieldId-1].match(oppositeColor));
                    rooms[roomId].selectedPiece = unitId;
                }

                io.of('/game' + roomId).to(socket.id).emit('find move response', res);
            }
        });

        socket.on('make a move', (fieldId) => {
            const roomId = Number(socket.nsp.name.replace('/game', ''));
            rooms[roomId].board[fieldId-1] = rooms[roomId].board[rooms[roomId].selectedPiece-1];
            rooms[roomId].board[rooms[roomId].selectedPiece-1] = "E";
            io.of('/game' + roomId).emit('move confirmed', rooms[roomId].board);
            socket.broadcast.emit('start turn');
        });
    });
}

export { sockets };