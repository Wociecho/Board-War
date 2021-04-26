const socket = io('/game' + roomId);
socket.on('connect', () => {
    socket.emit('player join', roomId);
});

socket.on('wait', () => {
    console.log('jesteś sam');
});

socket.on('game can start', () => {
    socket.emit('send nickname', username, roomId);
});

socket.on('set usernames', name => {
    if(name === username){
        document.querySelector('.pname1').innerText = name;
    } else {
        document.querySelector('.pname2').innerText = name;
    }
})