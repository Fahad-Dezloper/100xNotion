'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from './WebContext';

export default function WebSocketClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [roomId, setRoomId] = useState('');
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userEmail');
    const storedUserRole = localStorage.getItem('userRole');
    const roomId = localStorage.getItem("roomId");
    if(roomId){
      setRoomId(roomId || '');
    } else {
      console.error("No roomId found in localStorage");
    }


    setUserRole(storedUserRole || 'user');
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const generatedId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatUserId', generatedId);
      setUserId(generatedId);
    }

  }, []);

  if (!userId) {
    return <div>Initializing chat...</div>;
  }

  // console.log("WebSocketClientProvider userId", userId);

  return (
    <WebSocketProvider 
      userId={userId}
      userRole={userRole}
      roomId={roomId}
      serverUrl="ws://localhost:8080"
    >
      {children}
    </WebSocketProvider>
  );
}