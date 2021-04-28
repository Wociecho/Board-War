function updateUsernames(name){
    name === username ?
    document.querySelector('.pname1').innerText = name :
    document.querySelector('.pname2').innerText = name;
}

function updateBoard(board, whitePlayer){
    document.querySelectorAll('.filler').forEach((field, index, fields) => {
        fields[index].classList.add(board[index]);
    });
    if(username === whitePlayer){
        document.querySelectorAll('.filler').forEach(field => {
            field.classList.add('turned-filler');
        });
        document.querySelector('.board').style.transform = "rotate(180deg)";
    }
}