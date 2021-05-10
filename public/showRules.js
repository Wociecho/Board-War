let showRules = function(e) {
    console.log('dupa');
    e.stopPropagation();
    document.querySelector('.rules').style.display = 'block';
    document.querySelector('.show-rules').removeEventListener('click', showRules);
    window.addEventListener('click', hideRules);
    document.querySelector('.show-rules').innerHTML = '<i class="far fa-times-circle"></i>';
}

let hideRules = function(e) {
    e.stopImmediatePropagation();
    console.log('dupa 2');
    if(e.target === document.querySelector('.rules') || e.target === document.querySelector('.show-rules i')) {
        document.querySelector('.rules').style.display = 'none';
        window.removeEventListener('click', hideRules);
        document.querySelector('.show-rules').addEventListener('click', showRules);
        document.querySelector('.show-rules').innerHTML = '<i class="far fa-question-circle"></i>';
    }
}

document.querySelector('.show-rules').addEventListener('click', showRules);