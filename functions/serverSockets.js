import { rooms, isTwoPlayers, checkIfPlayerAlreadyInGame, resetRoom } from './roomsHandler.js';
import { checkLeft, findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        const roomId = Number(socket.nsp.name.replace('/game', ''));
        if(!rooms[roomId].started) {
            rooms[roomId].players++;
        }

        function checkIfGameCanBeContinued(){
            if(rooms[roomId].onMove === rooms[roomId].p1Id){
                rooms[roomId].onMove = rooms[roomId].p2Id;
            } else if(rooms[roomId].onMove === rooms[roomId].p2Id){
                rooms[roomId].onMove = rooms[roomId].p1Id;
            }
            setTimer(false);
            if(checkLeft(roomId) === 'continue') {
                io.of('/game' + roomId).to(rooms[roomId].onMove).emit('start turn');
                setTimer(true);
            } else {
                io.of('/game' + roomId).emit('end game', checkLeft(roomId));
                resetRoom(roomId);
            }
        }

        function setTimer(setOrReset) {
            if(setOrReset){
                rooms[roomId].time = rooms[roomId].onMove === 'dc' ? 11 : 31;
                rooms[roomId].counter = setInterval(() => {
                    io.of('/game' + roomId).emit('countdown', rooms[roomId].time - 1);
                    rooms[roomId].time --;
                    if(rooms[roomId].time === 0) {
                        setTimer(false);
                        if(rooms[roomId].onMove === rooms[roomId].p1Id) {
                            rooms[roomId].wLimit ++;
                        }
                        if(rooms[roomId].onMove === rooms[roomId].p2Id) {
                            rooms[roomId].bLimit ++;
                        }
                        checkIfGameCanBeContinued();
                    }
                }, 1000);
            }
            if(!setOrReset) {
                clearInterval(rooms[roomId].counter);
            }
        }

        socket.on("disconnect", (reason) => {
            const disconnectedId = checkIfPlayerAlreadyInGame(socket.id, 'id');
            if(disconnectedId !== undefined){
                if(!rooms[disconnectedId].started){
                    rooms[disconnectedId].players--;
                    if(rooms[disconnectedId].p1Id === socket.id) {
                        rooms[disconnectedId].p1Id = '';
                        rooms[disconnectedId].p1Name = '';
                    } else if(rooms[disconnectedId].p2Id === socket.id) {
                        rooms[disconnectedId].p2Id = '';
                        rooms[disconnectedId].p2Name = '';
                    }
                } else {
                    if(rooms[disconnectedId].p1Id === socket.id) {
                        rooms[disconnectedId].p1Id = 'dc';
                    } else if(rooms[disconnectedId].p2Id === socket.id) {
                        rooms[disconnectedId].p2Id = 'dc';
                    }
                    if(rooms[disconnectedId].p1Id === 'dc' && rooms[disconnectedId].p2Id === 'dc') {
                        setTimer(false);
                        resetRoom(disconnectedId);
                    } else if(rooms[disconnectedId].onMove === socket.id) {
                        rooms[disconnectedId].onMove = 'dc';
                    }
                }
            }
          });

        
        socket.on('player join', (username) => {
            if(rooms[roomId].started) {
                if(username === rooms[roomId].p1Name && rooms[roomId].p1Id === 'dc') {
                    rooms[roomId].p1Id = socket.id;
                } else if(username === rooms[roomId].p2Name && rooms[roomId].p2Id === 'dc') {
                    rooms[roomId].p2Id = socket.id;
                }
                if(rooms[roomId].onMove === 'dc') {
                    rooms[roomId].onMove = socket.id;
                    socket.emit('start turn');
                }
                socket.emit('set board', rooms[roomId].p1Name, rooms[roomId].p2Name, rooms[roomId].board, rooms[roomId].p1Id);
            }
            if(!rooms[roomId].started) {
                rooms[roomId].p1Name === "" ?
                (rooms[roomId].p1Name = username,
                rooms[roomId].p1Id = socket.id) :
                (rooms[roomId].p2Name = username,
                rooms[roomId].p2Id = socket.id);
                
                if(isTwoPlayers(roomId)) {
                    rooms[roomId].onMove = rooms[roomId].p1Id;
                    io.of('/game' + roomId).emit('set board', rooms[roomId].p1Name, rooms[roomId].p2Name, rooms[roomId].board, rooms[roomId].p1Id);
                    rooms[roomId].started = true;
                    io.of('/game' + roomId).to(rooms[roomId].p1Id).emit('start turn');
                    setTimer(true);
                }
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

        socket.on('make a move', fieldId => {
            let color;
            if(rooms[roomId].onMove === rooms[roomId].p1Id) color = 'W';
            if(rooms[roomId].onMove === rooms[roomId].p2Id) color = 'B';
            if(fieldId >=1 && fieldId <=49 && socket.id === rooms[roomId].onMove && rooms[roomId].board[rooms[roomId].selectedPiece-1]?.match(color)) {
                if(rooms[roomId].board[rooms[roomId].selectedPiece-1].match('T') && rooms[roomId].board[fieldId-1] !== 'E') {
                    rooms[roomId].board[fieldId-1] = 'E';
                } else {
                    rooms[roomId].board[fieldId-1] = rooms[roomId].board[rooms[roomId].selectedPiece-1];
                    rooms[roomId].board[rooms[roomId].selectedPiece-1] = "E";
                }
                io.of('/game' + roomId).emit('move confirmed', rooms[roomId].board);
                checkIfGameCanBeContinued(socket.id);
            }
        });
    });
}

export { sockets };