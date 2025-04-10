"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const users = {};
const rooms = {};
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    let userId = null;
    ws.on('message', function message(message) {
        try {
            // console.log(message);
            const data = JSON.parse(message.toString());
            console.log('received: %s', data);
            if (data.type === 'join') {
                userId = data.userId;
                if (userId) {
                    users[userId] = ws;
                }
                console.log(`User ${userId} joined`);
                // Option: Add user to a room
                if (data.room) {
                    if (!rooms[data.room]) {
                        rooms[data.room] = [];
                    }
                    if (userId) {
                        rooms[data.room].push(userId);
                    }
                }
            }
            else if (data.type === 'message') {
                // Broadcast message to all clients
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'message',
                            sender: userId,
                            content: data.content,
                        }));
                    }
                });
            }
            else if (data.type === 'admin') {
                // Admin functionality - broadcast to all or a specific room
                if (data.action === 'broadcast') {
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'admin_message',
                                content: data.content,
                            }));
                        }
                    });
                }
                else if (data.action === 'room_broadcast') {
                    // Broadcast to a specific room
                    if (rooms[data.room]) {
                        rooms[data.room].forEach(roomId => {
                            if (users[roomId] && users[roomId].readyState === WebSocket.OPEN) {
                                users[roomId].send(JSON.stringify({
                                    type: 'admin_message',
                                    content: data.content,
                                }));
                            }
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error Processing Message', error);
        }
    });
    ws.on('close', () => {
        // Clean up when a client disconnects
        if (userId) {
            delete users[userId];
            console.log(`User ${userId} disconnected`);
            // Remove user from rooms
            for (const room in rooms) {
                if (rooms[room].includes(userId)) {
                    rooms[room] = rooms[room].filter(id => id !== userId);
                }
            }
        }
    });
});
console.log('WebSocket server started on port 8080');
