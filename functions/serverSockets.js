import { rooms, isTwoPlayers } from './roomsHandler.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        console.log('connected');
        socket.on('player join', (roomId, username) => {
            rooms[roomId].playersnames.p1Name === "" ?
            rooms[roomId].playersnames.p1Name = username :
            rooms[roomId].playersnames.p2Name = username;
            
            isTwoPlayers(roomId) ?
            io.of('/game' + roomId).emit('start game') :
            io.of('/game' + roomId).emit('wait');
        });

        socket.on('send nickname', (username, roomId) => {
            io.of('/game' + roomId).emit('set usernames', username, rooms[roomId].board, rooms[roomId].playersnames.p1Name);
        });
    });
}

export { sockets };