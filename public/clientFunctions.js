function updateUsernames(name){
    name === username ?
    document.querySelector('.pname1').innerText = name :
    document.querySelector('.pname2').innerText = name;
}

function updateBoard(board, whitePlayerId){
    updateImages(board);
    if(socket.id === whitePlayerId){
        document.querySelectorAll('.filler').forEach(field => {
            field.classList.add('turned-filler');
        });
        document.querySelector('.board').style.transform = "rotate(180deg)";
    }
}

function updateImages(board) {
    document.querySelectorAll('.filler').forEach((field, index, fields) => {
        fields[index].classList.contains('turned-filler') ? fields[index].classList = 'filler turned-filler' : fields[index].classList = 'filler';
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