import { rooms } from './roomsHandler.js';

const board = ["WT", "WP", "WH", "WG", "WH", "WP", "WT",
"WS", "WS", "WS", "WS", "WS", "WS", "WS",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"E", "E", "E", "E", "E", "E", "E",
"BS", "BS", "BS", "BS", "BS", "BS", "BS",
"BT", "BP", "BH", "BG", "BH", "BP", "BT"];

function convertToXY(id) {
    const xCoord = id%7 || 7;
    const yCoord = id%7 === 0 ? id/7 : 1 + Math.floor(id/7);
    
    return ([xCoord, yCoord]);
}

function convertToId(xyArr) {
    return xyArr[0] + (xyArr[1] - 1) * 7
}

function findPossibleMovesAndTargets(roomId, id) {
    let piece = rooms[roomId].board[id-1];

    const [x, y] = convertToXY(id);
    let possibleCoords = [];
    let possibleTargets = [];

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
            possibleCoords = [[x+2, y], [x+1, y], [x-2, y], [x-1, y], [x, y+2], [x, y+1], [x, y-2], [x, y-1]];
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

    possibleCoords = possibleCoords.filter(coords => coords.every(xy => (xy > 0 && xy < 8))).map(leftCoords => convertToId(leftCoords));
    if(!possibleTargets.length) possibleTargets = possibleCoords;
    return [possibleCoords, possibleTargets];
}

export { board, findPossibleMovesAndTargets };