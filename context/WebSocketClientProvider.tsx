'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WebSocketProvider } from './WebContext';

export default function WebSocketClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const params = useParams();
  const roomId = params?.roomId as string;
  console.log("WebSocketClientProvider", roomId);

  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userEmail');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedUserRole) setUserRole(storedUserRole);

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

  return (
    <WebSocketProvider 
      userId={userId}
      userRole={userRole}
      roomId={roomId}
      serverUrl={'https://a9c8-103-214-60-35.ngrok-free.app'}
    >
      {children}
    </WebSocketProvider>
  );
}
