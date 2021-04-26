import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

import routes from './routes/game.js';
import { sockets } from './functions/serverSockets.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use('/', routes);

sockets(io);

const port = 3000;
httpServer.listen(port, () => {
    console.log(`Server started at port ${port}`)
});