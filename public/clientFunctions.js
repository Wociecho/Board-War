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
}

function updateImages(board) {
    document.querySelectorAll('.filler').forEach((field, index, fields) => {
        fields[index].classList.contains('turned') ? fields[index].classList = 'filler turned' : fields[index].classList = 'filler';
        fields[index].classList.add(board[index]);
    });
}

function colorFields(fields) {
    undoColorFields();
    fields[0].forEach(fieldId => {
        document.querySelectorAll('.field')[fieldId-1].classList.toggle('move-available');
    });
    fields[1].forEach(fieldId => {
        document.querySelectorAll('.field')[fieldId-1].classList.toggle('attack-available');
    });
}

function undoColorFields() {
    document.querySelectorAll('.field').forEach(field => {
        field.classList.remove('move-available');
        field.classList.remove('attack-available');
    });
}