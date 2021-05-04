import { rooms, isTwoPlayers, deleteRoom } from './roomsHandler.js';
import { checkLeft, findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        const roomId = rooms.findIndex(room => room.no == socket.nsp.name.replace('/game', ''));
        const room = rooms[roomId];
        if(!room.started) {
            room.players++;
        }

        function checkIfGameCanBeContinued(){
            if(room.onMove === room.p1Id){
                room.onMove = room.p2Id;
            } else if(room.onMove === room.p2Id){
                room.onMove = room.p1Id;
            }
            setTimer(false);
            if(checkLeft(room) === 'continue') {
                io.of('/game' + room.no).to(room.onMove).emit('start turn');
                setTimer(true);
            } else {
                io.of('/game' + room.no).emit('end game', checkLeft(room));
                deleteRoom(room);
            }
        }

        function setTimer(setOrReset) {
            if(setOrReset){
                room.time = room.onMove === 'dc' ? 11 : 31;
                room.counter = setInterval(() => {
                    io.of('/game' + room.no).emit('countdown', room.time - 1);
                    room.time --;
                    if(room.time === 0) {
                        setTimer(false);
                        if(room.onMove === room.p1Id) {
                            room.wLimit ++;
                        }
                        if(room.onMove === room.p2Id) {
                            room.bLimit ++;
                        }
                        checkIfGameCanBeContinued();
                    }
                }, 1000);
            }
            if(!setOrReset) {
                clearInterval(room.counter);
            }
        }

        socket.on("disconnect", (reason) => {
            if(!room.started){
                room.players--;
                if(room.p1Id === socket.id) {
                    room.p1Id = '';
                    room.p1Name = '';
                } else if(room.p2Id === socket.id) {
                    room.p2Id = '';
                    room.p2Name = '';
                }
            } else {
                if(room.p1Id === socket.id) {
                    room.p1Id = 'dc';
                } else if(room.p2Id === socket.id) {
                    room.p2Id = 'dc';
                }
                if(room.p1Id === 'dc' && room.p2Id === 'dc') {
                    setTimer(false);
                    deleteRoom(room);
                } else if(room.onMove === socket.id) {
                    room.onMove = 'dc';
                }
            }
        });

        
        socket.on('player join', (username) => {
            if(room.started) {
                console.log('wykonuje player join 1');
                if(username === room.p1Name && room.p1Id === 'dc') {
                    room.p1Id = socket.id;
                } else if(username === room.p2Name && room.p2Id === 'dc') {
                    room.p2Id = socket.id;
                }
                if(room.onMove === 'dc') {
                    room.onMove = socket.id;
                    socket.emit('start turn');
                }
                socket.emit('set board', room.p1Name, room.p2Name, room.board, room.p1Id);
            }
            if(!room.started) {
                console.log('wykonuje player join2');
                room.p1Name === "" ?
                (room.p1Name = username,
                room.p1Id = socket.id) :
                (room.p2Name = username,
                room.p2Id = socket.id);
                
                if(isTwoPlayers(room)) {
                    room.onMove = room.p1Id;
                    io.of('/game' + room.no).emit('set board', room.p1Name, room.p2Name, room.board, room.p1Id);
                    room.started = true;
                    io.of('/game' + room.no).to(room.p1Id).emit('start turn');
                    setTimer(true);
                }
            }
        });

        socket.on('find moves request', (unitId) => {
            if(unitId >=1 && unitId <=49 && socket.id === room.onMove){
                let res = [];
                let color, oppositeColor;
                
                if(room.p1Id === socket.id) { color = "W"; oppositeColor = "B"; }
                if(room.p2Id === socket.id) { color = "B"; oppositeColor = "W"; }

                room.board[unitId-1].match(color) ?
                res = findPossibleMovesAndTargets(room, unitId) :
                res = [];

                if(res.length > 0){
                    res[0] = res[0].filter(fieldId => !room.board[fieldId-1].match(color));
                    res[1] = res[1].filter(fieldId => room.board[fieldId-1].match(oppositeColor));
                    room.selectedPiece = unitId;
                }
                
                io.of('/game' + room.no).to(socket.id).emit('find move response', res);
            }
        });

        socket.on('make a move', fieldId => {
            let color;
            if(room.onMove === room.p1Id) color = 'W';
            if(room.onMove === room.p2Id) color = 'B';
            if(fieldId >=1 && fieldId <=49 && socket.id === room.onMove && room.board[room.selectedPiece-1]?.match(color)) {
                if(room.board[room.selectedPiece-1].match('T') && room.board[fieldId-1] !== 'E') {
                    room.board[fieldId-1] = 'E';
                } else {
                    room.board[fieldId-1] = room.board[room.selectedPiece-1];
                    room.board[room.selectedPiece-1] = "E";
                }
                io.of('/game' + room.no).emit('move confirmed', room.board);
                checkIfGameCanBeContinued(socket.id);
            }
        });
    });
}

export { sockets };