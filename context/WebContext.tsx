import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface WebSocketContextType {
  connected: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
  joinRoom: (room: string) => void;
  sendAdminBroadcast: (content: string) => void;
  sendRoomBroadcast: (room: string, content: string) => void;
  clearMessages: () => void;
  userId: string;
  totalUsers: number | null;
  editorContent: string | null;
  activeUserEmail: string | null;
}

interface Message {
  type: 'message' | 'admin_message';
  sender?: string;
  content: string;
  timestamp: Date;
}

interface WebSocketProviderProps {
  children: ReactNode;
  userId: string;
  serverUrl: string;
  userRole: string;
  roomId: string;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};


export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  userId,
  userRole,
  roomId,
  serverUrl 
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string | null>('');
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>('');

  useEffect(() => {
    const ws = new WebSocket(serverUrl);
    setCurrentRoom(roomId);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      setSocket(ws);

      ws.send(JSON.stringify({
        type: 'join',
        userId: userId,
        roomId: roomId
      }));
    };

    ws.onmessage = (event) => {
      try{
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "message":
            // console.log("Message received:", data.sender);
            setEditorContent(data.content);
            setActiveUserEmail(data.sender);
            break;
          case "total_users":
            // console.log("Total users connected:", data.total);
            setTotalUsers(data.total);
            break;
          case "message_history":
            // console.log("Message history received:", data.messages);
            setEditorContent(data.messages[0].content);
            break;
          default:
            console.log("Unknown Websocket event:", data);
            break;
        }
      } catch (e){
        console.error('Error processing message:', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [userId, serverUrl, roomId]);

  // // Send a regular message
  const sendMessage = (content: string) => {
    // console.log("Sending message:", content);
    if (socket && connected) {
      socket.send(JSON.stringify({
        type: 'message',
        sender: userId,
        content: content,
      })
    );
    setEditorContent(content);
    }
  };

  return (
    <WebSocketContext.Provider value={{messages, sendMessage, userId, totalUsers, editorContent, connected, activeUserEmail}}>
      {children}
    </WebSocketContext.Provider>
  );
};