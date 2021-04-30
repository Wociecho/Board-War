import { rooms, isTwoPlayers } from './roomsHandler.js';
import { checkLeft, findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        const roomId = Number(socket.nsp.name.replace('/game', ''));

        function checkIfGameCanBeContinued(currentPlayerId){
            if(currentPlayerId === rooms[roomId].p1Id){
                console.log('na ruchu byl bialy');
                rooms[roomId].onMove = rooms[roomId].p2Id;
            }
            if(currentPlayerId === rooms[roomId].p2Id){
                console.log('na ruchu czarny');
                rooms[roomId].onMove = rooms[roomId].p1Id;
            }
            setTimer(false);
            if(checkLeft(roomId) === 'continue') {
                io.of('/game' + roomId).to(rooms[roomId].onMove).emit('start turn');
                setTimer(true, rooms[roomId].onMove);
            } else {
                io.of('/game' + roomId).emit('end game', checkLeft(roomId));
            }
        }

        function setTimer(setOrReset, socketId) {
            if(setOrReset){
                rooms[roomId].time = 31;
                rooms[roomId].counter = setInterval(() => {
                    io.of('/game' + roomId).emit('countdown', rooms[roomId].time - 1);
                    rooms[roomId].time --;
                    if(rooms[roomId].time === 0) {
                        setTimer(false);
                        //przeciwne wartości, bo id otrzymujemy od gracza kończącego turę
                        if(socketId === rooms[roomId].p1Id) {
                            rooms[roomId].bLimit ++;
                        }
                        if(socketId === rooms[roomId].p2Id) {
                            rooms[roomId].wLimit ++;
                        }
                        checkIfGameCanBeContinued(socketId);
                    }
                }, 1000);
            }
            if(!setOrReset) {
                clearInterval(rooms[roomId].counter);
            }
        }

        console.log('connected');
        socket.on('player join', (username) => {
            socket.username = username;
            
            rooms[roomId].p1Name === "" ?
            (rooms[roomId].p1Name = username,
            rooms[roomId].p1Id = socket.id) :
            (rooms[roomId].p2Name = username,
            rooms[roomId].p2Id = socket.id);
            
            if(isTwoPlayers(roomId)) {
                rooms[roomId].onMove = rooms[roomId].p1Id;
                io.of('/game' + roomId).emit('start game');
            }
        });

        socket.on('send nickname', (username) => {
            io.of('/game' + roomId).emit('set board', username, rooms[roomId].board, rooms[roomId].p1Id);
            if(!rooms[roomId].started) {
                rooms[roomId].started = true;
                io.of('/game' + roomId).to(rooms[roomId].p1Id).emit('start turn');
                setTimer(true, rooms[roomId].p1Id);
            }
        });

        socket.on('find moves request', (unitId) => {
            if(unitId >=1 && unitId <=49 && socket.id === rooms[roomId].onMove){
                let res = [];
                let color, oppositeColor;
                
                if(rooms[roomId].p1Id === socket.id) { color = "W"; oppositeColor = "B"; }
                if(rooms[roomId].p2Id === socket.id) { color = "B"; oppositeColor = "W"; }

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
            if(fieldId >=1 && fieldId <=49 && socket.id === rooms[roomId].onMove) {
                if(rooms[roomId].board[rooms[roomId].selectedPiece-1].match('T') && rooms[roomId].board[fieldId-1] !== 'E') {
                    rooms[roomId].board[fieldId-1] = 'E';
                } else {
                    rooms[roomId].board[fieldId-1] = rooms[roomId].board[rooms[roomId].selectedPiece-1];
                    rooms[roomId].board[rooms[roomId].selectedPiece-1] = "E";
                }
                io.of('/game' + roomId).emit('move confirmed', rooms[roomId].board);
                //wysylane id tego, ktory skonczyl
                checkIfGameCanBeContinued(socket.id);
            }
        });
    });
}

export { sockets };