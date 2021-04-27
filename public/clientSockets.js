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

socket.on('set usernames', (name, board, whitePlayer) => {
    name === username ?
    document.querySelector('.pname1').innerText = name :
    document.querySelector('.pname2').innerText = name;

    updateBoard(board, whitePlayer);
});