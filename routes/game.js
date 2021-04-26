import express from 'express';
const router = express.Router();
import { findRoom } from '../functions/roomsHandler.js';

router.route("/").get((req, res) => {
    res.render('enterGame');
});

router.route("/game").post((req, res) => {
    res.cookie('username', req.body.username);
    res.redirect('/game' + findRoom());
});

router.route('/game:roomId').get((req, res) => {
    console.log(req.cookies.username);
    res.render('playGame', { username: req.cookies.username, roomId: req.params.roomId });
});



export default router;