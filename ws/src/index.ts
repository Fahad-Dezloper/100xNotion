import { WebSocketServer } from "ws";

const ws = new WebSocketServer({port: 8080});

ws.on("connection", (wss) => {
    console.log("Client connected");

    wss.on("message", (message) => {
        console.log(`Received message: ${message}`);
        wss.send(`Echo: ${message}`);
    });

})

