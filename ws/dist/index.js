"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const ws_1 = require("ws");
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
// Create Redis clients
const redis = new ioredis_1.default(); // For general operations
const sub = new ioredis_1.default(); // For subscriptions
// WebSocket server setup
const wss = new ws_1.WebSocketServer({ port: 8080 });
// Local storage for active connections
const users = {};
const rooms = {};
// Redis keys and constants
const ROOMS_KEY = 'ws:rooms';
const MESSAGES_KEY = 'ws:messages';
const USER_COUNT_KEY = 'ws:user_count';
const MESSAGE_EXPIRY = 60 * 60 * 12; // 12 hours in seconds
// Initialize server
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Set up Redis subscription for messages between server instances
        sub.subscribe('ws:broadcast');
        sub.on('message', (channel, message) => {
            const data = JSON.parse(message);
            broadcastToClients(data, true);
        });
        console.log('WebSocket server initialized with Redis');
    });
}
// Handle broadcasting messages to clients
function broadcastToClients(data, fromRedis = false) {
    // If message has a room field, only send to users in that room
    console.log("broadcastToClients", data);
    const roomKey = data.room;
    const roomUsers = rooms[roomKey] || [];
    if (roomUsers.length > 0) {
        // Send only to users in the specified room
        wss.clients.forEach(client => {
            const clientUserId = Object.keys(users).find(id => users[id] === client);
            if (client.readyState === WebSocket.OPEN &&
                clientUserId &&
                roomUsers.includes(clientUserId)) {
                client.send(JSON.stringify(data));
            }
        });
    }
    else {
        // If no room specified or room doesn't exist, fallback to broadcast to all
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
    // If this is a local message, publish to Redis for other server instances
    if (!fromRedis && data.type === 'message') {
        pub.publish('ws:broadcast', JSON.stringify(data));
    }
}
function storeMessage(roomKey, messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageId = (0, uuid_1.v4)();
        const storedData = Object.assign(Object.assign({}, messageData), { id: messageId, timestamp: Date.now() });
        // Store message in room's message list
        const messageListKey = `${MESSAGES_KEY}:${roomKey}`;
        // Add message to the list
        yield redis.lpush(messageListKey, JSON.stringify(storedData));
        // Trim list to maintain reasonable size (optional)
        yield redis.ltrim(messageListKey, 0, 999);
        // Set expiration for the entire message list - reset to 12 hours whenever new message arrives
        yield redis.expire(messageListKey, MESSAGE_EXPIRY);
        return storedData;
    });
}
// Fetch message history for a room
function getMessageHistory(roomKey_1) {
    return __awaiter(this, arguments, void 0, function* (roomKey, limit = 100) {
        const messageListKey = `${MESSAGES_KEY}:${roomKey}`;
        const messages = yield redis.lrange(messageListKey, 0, limit - 1);
        // Reset expiration whenever history is fetched
        yield redis.expire(messageListKey, MESSAGE_EXPIRY);
        return messages.map(msg => JSON.parse(msg));
    });
}
// Connect event handler
wss.on('connection', function connection(ws) {
    let userId = null;
    const userRooms = [];
    ws.on('error', console.error);
    ws.on('message', function message(rawMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.parse(rawMessage.toString());
                // console.log('received:', data);
                switch (data.type) {
                    case 'join': {
                        userId = data.userId || (0, uuid_1.v4)();
                        if (userId) {
                            users[userId] = ws;
                        }
                        // console.log(`User ${userId} joined ${data.roomId}`);
                        // Send confirmation to the user
                        ws.send(JSON.stringify({
                            type: 'joined',
                            userId: userId,
                            roomId: data.roomId,
                        }));
                        // Handle room joining
                        if (!data.roomId)
                            break;
                        const roomKey = data.roomId;
                        if (!rooms[roomKey]) {
                            rooms[roomKey] = [];
                            // Check if room data exists in Redis
                            const roomData = yield redis.hget(ROOMS_KEY, roomKey);
                            if (roomData) {
                                rooms[roomKey] = JSON.parse(roomData);
                            }
                        }
                        // Add user to room
                        if (userId) {
                            rooms[roomKey].push(userId);
                        }
                        userRooms.push(roomKey);
                        // Update room data in Redis
                        yield redis.hset(ROOMS_KEY, roomKey, JSON.stringify(rooms[roomKey]));
                        // Always send message history on join/refresh
                        const history = yield getMessageHistory(roomKey);
                        // console.log(roomKey, 'history:', history);
                        ws.send(JSON.stringify({
                            type: 'message_history',
                            room: roomKey,
                            messages: history
                        }));
                        // Notify others about new user
                        broadcastToClients({
                            type: 'user_joined_room',
                            room: roomKey,
                            userId: userId,
                            totalUsers: rooms[roomKey].length
                        });
                        break;
                    }
                    case 'message': {
                        if (!userId)
                            break;
                        const roomKey = data.roomId;
                        console.log("message roomKey", roomKey);
                        // Store message in Redis with proper expiration
                        const messageData = yield storeMessage(roomKey, {
                            sender: userId,
                            content: data.content,
                            room: roomKey
                        });
                        console.log("message data", messageData);
                        // Broadcast to connected clients
                        broadcastToClients(Object.assign({ type: 'message' }, messageData));
                        break;
                    }
                    case 'get_history': {
                        if (!userId)
                            break;
                        const roomKey = data.roomId;
                        const history = yield getMessageHistory(roomKey, data.limit || 100);
                        ws.send(JSON.stringify({
                            type: 'message_history',
                            room: roomKey,
                            messages: history
                        }));
                        break;
                    }
                }
            }
            catch (error) {
                console.error('Error Processing Message', error);
            }
        });
    });
    ws.on('close', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!userId)
            return;
        // Clean up user data
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        // Remove user from all rooms
        for (const roomKey of userRooms) {
            if ((_a = rooms[roomKey]) === null || _a === void 0 ? void 0 : _a.includes(userId)) {
                rooms[roomKey] = rooms[roomKey].filter(id => id !== userId);
                // Update Redis
                if (rooms[roomKey].length > 0) {
                    yield redis.hset(ROOMS_KEY, roomKey, JSON.stringify(rooms[roomKey]));
                }
                else {
                    // If room is empty, remove room data but keep messages
                    yield redis.hdel(ROOMS_KEY, roomKey);
                    // Messages will automatically expire after 12 hours due to TTL
                }
                // Notify others
                broadcastToClients({
                    type: 'user_left_room',
                    room: roomKey,
                    userId,
                    totalUsers: rooms[roomKey].length
                });
            }
        }
    }));
});
// Initialize and start the server
initServer().then(() => {
    console.log('WebSocket server started on port 8080 with enhanced Redis persistence');
});
// Simple function to republish from Redis to WebSocket
// This ensures new server instances can broadcast from Redis to WS clients
const pub = redis;
