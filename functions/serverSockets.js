import { isTwoPlayers } from './roomsHandler.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        console.log('connected');
        socket.on('player join', roomId => {
            isTwoPlayers(roomId) ? io.of('/game' + roomId).emit('game can start') : io.of('/game' + roomId).emit('wait');
        });

        socket.on('send nickname', (username, roomId) => {
            io.of('/game' + roomId).emit('set usernames', username);
        });
    });
}

export { sockets };