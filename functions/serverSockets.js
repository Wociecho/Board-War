import { rooms, deleteRoom } from './roomsHandler.js';
import { checkLimits, findPossibleMovesAndTargets } from './boardStatus.js';

function sockets(io){
    io.of(/^\/game\d+$/).on('connection', socket => {
        const roomId = rooms.findIndex(room => room.no == socket.nsp.name.replace('/game', ''));
        const room = rooms[roomId];
        if(roomId === -1) {
            socket.emit('error');
        } else if(!room.started) {
            room.players++;
        }

        function checkIfGameCanBeContinued(){
            setTimer(false);
            if(checkLimits(room) === false) {
                if(room.onMove === room.p1Id){
                    room.onMove = room.p2Id;
                } else if(room.onMove === room.p2Id){
                    room.onMove = room.p1Id;
                }
                io.of('/game' + room.no).to(room.onMove).emit('start turn');
                setTimer(true);
                io.of('/game' + room.no).emit('update on move', room.onMove);
            } else {
                room.ended = true;
                io.of('/game' + room.no).emit('end game', checkLimits(room));
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
            if(rooms.findIndex(room => room.no == socket.nsp.name.replace('/game', '')) !== -1){
                if(!room.started){
                    room.players--;
                    if(room.p1Id === socket.id) {
                        room.p1Id = '';
                        room.p1Name = '';
                    } else if(room.p2Id === socket.id) {
                        room.p2Id = '';
                        room.p2Name = '';
                    }
                } else if(room.started){
                    if(room.p1Id === socket.id) {
                        room.p1Id = 'dc';
                        io.of('/game' + room.no).to(room.p2Id).emit('oponnent dc', false);
                    } else if(room.p2Id === socket.id) {
                        room.p2Id = 'dc';
                        io.of('/game' + room.no).to(room.p1Id).emit('oponnent dc', false);
                    }
                    if(room.p1Id === 'dc' && room.p2Id === 'dc') {
                        setTimer(false);
                        deleteRoom(room);
                    } else if(room.onMove === socket.id) {
                        room.onMove = 'dc';
                    }
                    room.request = '';
                }
            };
        });
        
        socket.on('player join', (username) => {
            if(room.started) {
                if(username === room.p1Name && room.p1Id === 'dc') {
                    room.p1Id = socket.id;
                    io.of('/game' + room.no).to(room.p2Id).emit('oponnent dc', true);
                } else if(username === room.p2Name && room.p2Id === 'dc') {
                    room.p2Id = socket.id;
                    io.of('/game' + room.no).to(room.p1Id).emit('oponnent dc', true);
                }
                if(room.onMove === 'dc') {
                    room.onMove = socket.id;
                    socket.emit('start turn');
                    io.of('/game' + room.no).emit('update on move', room.onMove);
                }
                socket.emit('set board', room.p1Name, room.p2Name, room.board, room.p1Id);
            }
            if(!room.started) {
                room.p1Name === "" ?
                (room.p1Name = username,
                room.p1Id = socket.id) :
                (room.p2Name = username,
                room.p2Id = socket.id);
                if(room.players === 2) {
                    room.onMove = room.p1Id;
                    io.of('/game' + room.no).emit('set board', room.p1Name, room.p2Name, room.board, room.p1Id);
                    room.started = true;
                    io.of('/game' + room.no).to(room.p1Id).emit('start turn');
                    setTimer(true);
                    io.of('/game' + room.no).emit('update on move', room.onMove);
                }
            }
        });

        socket.on('find moves request', (unitId) => {
            if(unitId >=1 && unitId <=49 && socket.id === room.onMove && !room.ended){
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
            if(fieldId >=1 && fieldId <=49 && socket.id === room.onMove && room.board[room.selectedPiece-1]?.match(color) && !room.ended) {
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

        socket.on('send message', (message, username) => {
            io.of('/game' + room.no).emit('add message', message, username);
        });

        socket.on('offer draw', () => {
            if(room.p1Id === 'dc' || room.p2Id === 'dc') {
                socket.emit('draw req sended', 'Przeciwnik rozłączony, spróbuj ponownie');
            } else if(room.started && room.request !== 'draw' && !room.ended) {
                room.request = 'draw';
                let userAsked = socket.id === room.p1Id ? room.p2Name : socket.id === room.p2Id ? room.p1Name : '';
                room.expectedAnswerFrom = userAsked;
                socket.emit('draw req sended', 'Zaproponowano remis');
                socket.broadcast.emit('confirmed offer draw');
            }
        });

        socket.on('answer draw', answer => {
            if(room.request === 'draw') {
                let answerFrom = socket.id === room.p1Id ? room.p1Name : socket.id === room.p2Id ? room.p2Name : '';
                if(answerFrom === room.expectedAnswerFrom) {
                    room.request = '';
                    if(answer){
                        setTimer(false);
                        room.ended = true;
                        io.of('/game' + room.no).emit('end game', 'draw');
                        deleteRoom(room);
                    }
                }
            }
        });

        socket.on('answer surrender', answer => {
            if(room.started && !room.ended && answer){
                let winner = socket.id === room.p1Id ? room.p2Id : socket.id === room.p2Id ? room.p1Id : '';
                setTimer(false);
                room.ended = true;
                io.of('/game' + room.no).emit('end game', winner, true);
                deleteRoom(room);
            }
        });
    });
}

export { sockets };