function convertToXY(id) {
    const xCoord = id%7 || 7;
    const yCoord = id%7 === 0 ? id/7 : 1 + Math.floor(id/7);
    
    return ([xCoord, yCoord]);
}

function convertToId(xyArr) {
    return xyArr[0] + (xyArr[1] - 1) * 7
}

function findPossibleMovesAndTargets(room, id) {
    let piece = room.board[id-1];

    const [x, y] = convertToXY(id);
    let possibleCoords = [];
    let possibleTargets = [];
    let additionalCoords = [];

    switch(piece){
        //soldier or general
        case 'WS':
        case 'BS':
        case 'WG':
        case 'BG':
            possibleCoords = [[x, y+1], [x, y-1], [x+1, y], [x-1, y], [x+1, y+1], [x+1, y-1], [x-1, y-1], [x-1, y+1]];
            break;
        //tank
        case 'WT':
        case 'BT':
            possibleCoords = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
            additionalCoords = [[x+2, y], [x-2, y], [x, y+2], [x, y-1]];
            for(let i = -2; i < 3; i++){
                for(let j = -2; j < 3; j++){
                    possibleTargets.push([x + i, y + j]);
                }
            }
            possibleTargets = possibleTargets.filter(coords => coords.every(xy => (xy > 0 && xy < 8))).map(leftCoords => convertToId(leftCoords));
            break;
        //plane
        case 'WP':
        case 'BP':
            possibleCoords = [[x+1, y+1], [x+2, y+2], [x+3, y+3], [x-1, y-1], [x-2, y-2], [x-3, y-3], [x+1, y-1], [x+2, y-2], [x+3, y-3], [x-1, y+1], [x-2, y+2], [x-3, y+3]];
            break;
        //helicopter
        case 'WH':
        case 'BH':
            possibleCoords = [[x+2, y], [x-2, y], [x, y+2], [x, y-2], [x+2, y+2], [x+2, y-2], [x-2, y+2], [x-2, y-2]];
            break;
        case 'E':
            break;
        default:
            break;
    }

    if(piece.match('T')){
        let color = piece.match('W') ? 'W' : 'B';
        possibleCoords.forEach((coord, index) => {
            if(room.board[convertToId(coord)-1] === 'E'){
                possibleCoords.push(additionalCoords[index]);
            }
        });
    }

    possibleCoords = possibleCoords.filter(coords => coords.every(coord => (coord > 0 && coord < 8))).map(leftCoords => convertToId(leftCoords));
    if(!possibleTargets.length) possibleTargets = possibleCoords;
    return [possibleCoords, possibleTargets];
}

function checkLeft(room) {
    let wGeneral = room.board.indexOf('WG') !== -1 ? 2 : 0;
    let bGeneral = room.board.indexOf('BG') !== -1 ? 2 : 0;
    
    let whiteLeft = room.board.filter(field => field.match('W')).length + wGeneral;
    let blackLeft = room.board.filter(field => field.match('B')).length + bGeneral;

    if(whiteLeft <= room.wLimit){
        return (room.p2Id);
    }
    if(blackLeft <= room.bLimit){
        return (room.p1Id);
    }
    return ('continue');
}

export { checkLeft, findPossibleMovesAndTargets };