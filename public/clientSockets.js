const socket = io('/game' + roomId);

socket.on('connect', () => {
    socket.emit('player join', roomId, username);
});

socket.on('wait', () => {
    console.log('jesteś sam');
});

socket.on('start game', () => {
    socket.emit('send nickname', username, roomId);
});

socket.on('set board', (name, board, whitePlayer) => {
    updateUsernames(name);
    updateBoard(board, whitePlayer);
});

socket.on('start turn', () => {
    document.querySelector('.board').addEventListener('click', (e) => {
        socket.emit('find moves request', roomId, e.target.parentElement.dataset.fieldid);
    });
});

socket.on('find move response', (res) => {
    if(res.length > 0){
        document.querySelector('.board').addEventListener('click', (e) => {    
            const id = Number(e.target.parentElement.dataset.fieldid);
            if(res[0].includes(id)){
                console.log('can go');
            };
            if(res[1].includes(id)){
                console.log('can hit');
            }
        });
    }
});