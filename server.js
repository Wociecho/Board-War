import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import favicon from 'serve-favicon';
import { createServer } from "http";
import { Server } from "socket.io";
import routes from './routes/routes.js';
import { sockets } from './functions/serverSockets.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(favicon(path.join('public', 'img', 'favicon.ico')));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use('/', routes);

sockets(io);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`Server started at port ${port}`);
});