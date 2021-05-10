const socket = io('/game' + roomId);

socket.on('connect', () => {
    socket.emit('player join', username);
    startChat();
});

socket.on('set board', (nameP1, nameP2, board, whitePlayerId) => {
    updateUsernames(nameP1, nameP2);
    updateBoard(board, whitePlayerId);
    activateDrawAndSurrButtons();
});

socket.on('update on move', playerOnMove => {
    highlightOnMovePlayer(playerOnMove, socket.id);
});

socket.on('start turn', () => {
    document.querySelector('.board').addEventListener('click', findMoves);
});

socket.on('countdown', timeLeft => {
    document.querySelector('.timer').innerText = timeLeft;
});

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

socket.on('oponnent dc', connected => {
    let oponnentName = document.querySelector('.pname2');
    connected ? oponnentName.classList.remove('pnameDc') : oponnentName.classList.add('pnameDc');
});

socket.on('end game', (winner, ifSurrender) => {
    let finalContainer = document.querySelector('.game-status-container');
    let finalMessage = document.querySelector('.win-alert');
    if(winner === 'draw'){
        finalMessage.innerText = "Remis!";
    } else if(socket.id === winner){
        finalMessage.innerText = "Gratulacje, wygrałeś!";
        if(ifSurrender) {
            finalMessage.innerText += ' Przeciwnik zrezygnował.';
        }
    } else {
        finalMessage.innerText = "Porażka";
    }
    finalContainer.style.display = 'block';
    if(document.querySelector('.board').classList.contains('turned')) {
        finalContainer.classList.add('turned');
    }
    document.querySelector('.play-again').style.display = 'block';
    document.querySelector('.play-again').addEventListener('click', () => {
        window.location.replace('/');
    });
});

socket.on('add message', (message, uname) => {
    newMessage(message, uname);
});

socket.on('draw req sended', message => {
    newMessage(message, '', true);
});

socket.on('confirmed offer draw', () => {
    setAlert('draw');
});

socket.on('error', () => {
    window.location.replace('/error');
});