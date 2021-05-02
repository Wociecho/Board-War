import express from 'express';
const router = express.Router();
import { findRoom, checkIfPlayerAlreadyInGame, rooms } from '../functions/roomsHandler.js';

router.route('/').get((req, res) => {
    if(req.cookies.username) {
        const inGameIndex = checkIfPlayerAlreadyInGame(req.cookies.username, 'name');
        inGameIndex !== undefined ? res.redirect(`/game${inGameIndex}`) : res.redirect(`/game${findRoom()}`);
        } else {
        res.render('enterGame');
    }
});

router.route('/game').post((req, res) => {
    const inGameIndex = checkIfPlayerAlreadyInGame(req.body.username, 'name');
    //jeżeli istnieje połączony z takim nickiem brak akceptacji
    if(inGameIndex !== undefined){
        if((req.body.username === rooms[inGameIndex].p1Name && rooms[inGameIndex].p1Id !== 'dc') || (req.body.username === rooms[inGameIndex].p2Name && rooms[inGameIndex].p2Id !== 'dc')){
            res.redirect('/error');
        }
    } else {
        res.cookie('username', req.body.username);
        res.redirect('/');
    }
});

router.route('/game:roomId').get((req, res) => {
    if(req.cookies.username) {
        const inGameIndex = checkIfPlayerAlreadyInGame(req.cookies.username, 'name');
        if(inGameIndex == req.params.roomId){
            res.render('playGame', { username: req.cookies.username, roomId: req.params.roomId });
        } else if(inGameIndex !== undefined) {
            res.redirect(`/game${inGameIndex}`);
        } else if(req.params.roomId == rooms.length-1 && !rooms[req.params.roomId].started){
            res.render('playGame', { username: req.cookies.username, roomId: req.params.roomId });
        } else {
            res.redirect(`/game${findRoom()}`);
        }
    } else {
        res.redirect('/');
    }
});

router.route('/error').get((req, res) => {
    res.render('error');
});

router.route('/*').get((req, res) => {
    res.redirect('/');
});



export default router;