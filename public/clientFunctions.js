function updateUsernames(name1, name2){
    switch(username) {
        case name1:
            document.querySelector('.pname1').innerText = name1;
            document.querySelector('.pname2').innerText = name2;
            break;
        case name2:
            document.querySelector('.pname1').innerText = name2;
            document.querySelector('.pname2').innerText = name1;
            break;
        default:
            document.querySelector('.pname1').innerText = 'You';
            document.querySelector('.pname2').innerText = 'Oponnent';
            break;
    }
}

function updateBoard(board, whitePlayerId){
    updateImages(board);
    if(socket.id === whitePlayerId){
        document.querySelectorAll('.filler').forEach(field => {
            field.classList.add('turned');
        });
        document.querySelector('.board').classList.add('turned');
    }
    document.querySelector('.game-status-container').style.display = 'none';
}

function updateImages(board) {
    document.querySelectorAll('.filler').forEach((field, index, fields) => {
        fields[index].classList.contains('turned') ? fields[index].classList = 'filler turned' : fields[index].classList = 'filler';
        fields[index].classList.add(board[index]);
    });
}

function activateDrawAndSurrButtons() {
    document.querySelector('.offer-draw').addEventListener('click', () => {
        socket.emit('offer draw');
    });
    document.querySelector('.surrender').addEventListener('click', () => {
        setAlert('surrender');
    });
}

function startChat() {
    document.querySelector('.chat-form').addEventListener('submit', e => {
        e.preventDefault();
        let message = document.querySelector('.chat-input');
        if(message.value.length > 0 && message.value.length < 101){
            socket.emit('send message', message.value, username);
            message.value = '';
        }
    });
}

function colorFields(fields) {
    undoColorFields();
    fields[0].forEach(fieldId => {
        document.querySelectorAll('.field')[fieldId-1].classList.add('move-available');
    });
    fields[1].forEach(fieldId => {
        document.querySelectorAll('.field')[fieldId-1].classList.add('attack-available');
    });
}

function undoColorFields() {
    document.querySelectorAll('.field').forEach(field => {
        field.classList.remove('move-available');
        field.classList.remove('attack-available');
    });
}

function highlightOnMovePlayer(playerOnMove, socketId) {
    let names = [document.querySelector('.pname1'), document.querySelector('.pname2')];
    names.forEach(name => {
        if(name.classList.contains('on-move-higlighted')){
            name.classList.remove('on-move-higlighted');
        }
    });
    socketId === playerOnMove ?
    names[0].classList.add('on-move-higlighted') :
    names[1].classList.add('on-move-higlighted');
}

function findMoves(e) {
    socket.emit('find moves request', e.target.parentElement.dataset.fieldid);
}

function newMessage(message, uname, onlyInfo) {
    var chat = document.querySelector('.chat-messages');
    if(onlyInfo){
        const mParagraph = document.createElement('p');
        const mMessage = document.createTextNode(message);
        mParagraph.appendChild(mMessage);
        chat.appendChild(mParagraph);
    } else {
        if(chat.lastChild?.classList.contains('from' + uname)) {
            const mParagraph = document.createElement('p');
            const mMessage = document.createTextNode(message);
            mParagraph.appendChild(mMessage);
            chat.lastChild.appendChild(mParagraph);
        } else {
            const mDiv = document.createElement("div");
            const mParagraph = document.createElement('p');
            const mMessage = document.createTextNode(message);
            mDiv.classList.add('from' + uname);
            mDiv.classList.add('chat-message');
            mParagraph.appendChild(mMessage);
            mDiv.appendChild(mParagraph);
            chat.appendChild(mDiv);
        }
    }
    chat.scrollTop = chat.scrollHeight;
}

function setAlert(type) {
    let dAlert = document.querySelector('.alert-message');
    let acceptButton = document.querySelector('.accept-button');
    let declineButton = document.querySelector('.decline-button');
    if(dAlert.style.display === 'block') {
        declineButton.click();
    }
    setAlertMessage(type);
    dAlert.style.display = 'block';
    acceptButton.addEventListener('click', accept = () => {
        socket.emit('answer ' + type, true);
        dAlert.style.display = 'none';
        acceptButton.removeEventListener('click', accept);
        declineButton.removeEventListener('click', decline);
    });
    document.querySelector('.decline-button').addEventListener('click', decline = () => {
        if(type === 'draw') {
            socket.emit('answer ' + type, false);
        }
        dAlert.style.display = 'none';
        acceptButton.removeEventListener('click', accept);
        declineButton.removeEventListener('click', decline);
    });
}

function setAlertMessage(type) {
    if(type === 'draw') {
        document.querySelector('.alert-message-text').innerText = 'Rywal proponuje remis. Zaakceptować?';
    }
    if(type === 'surrender') {
        document.querySelector('.alert-message-text').innerText = 'Chcesz się poddać?';
    }
}