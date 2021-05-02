const socket = io('/game' + roomId);

socket.on('connect', () => {
    socket.emit('player join', username);
});

socket.on('set board', (nameP1, nameP2, board, whitePlayerId) => {
    updateUsernames(nameP1, nameP2);
    updateBoard(board, whitePlayerId);
});

function findMoves(e) {
    socket.emit('find moves request', e.target.parentElement.dataset.fieldid);
};

socket.on('start turn', () => {
    document.querySelector('.board').addEventListener('click', findMoves)
});

socket.on('countdown', timeLeft => {
    document.querySelector('.timer').innerText = timeLeft;
})

socket.on('find move response', (res) => {
    if(res.length > 0){
        colorFields(res);
        document.querySelector('.board').addEventListener('click', function markValidFields(e) {
            const id = Number(e.target.parentElement.dataset.fieldid);
            if(res[0].includes(id) || res[1].includes(id)){
                document.querySelector('.board').removeEventListener('click', findMoves);
                socket.emit('make a move', id);
                undoColorFields();
                document.querySelector('.board').removeEventListener('click', markValidFields);
            }
        });
    }
});

socket.on('move confirmed', board => {
    updateImages(board);
});

socket.on('end game', winner => {
    if(socket.id === winner){
        document.querySelector('.win-alert').innerText = "Gratulacje, wygrałeś!";
    } else {
        document.querySelector('.win-alert').innerText = "Buuuuuuu";
    }
})