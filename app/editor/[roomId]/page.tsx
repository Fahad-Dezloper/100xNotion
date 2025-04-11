"use client"
import { RichTextEditorDemo } from "@/components/tiptap/rich-text-editor";
import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { useWebSocket } from "@/context/WebContext";
import { use } from 'react';

export default function Page({params}: { params: Promise<{ roomId: string }> }) {
  // const router = useRouter();
  const { roomId } = use(params);
  const { joinRoom } = useWebSocket();

  // const roomId = localStorage.getItem("roomId");
  // const userId = localStorage.getItem("userEmail");
  // console.log("roomId", roomId);
  // console.log("userId", userId);
  useEffect(() => {
    if (roomId && typeof roomId === 'string') {
      // Join the room whenever the roomId in the URL changes
      joinRoom(roomId);
    }
  }, [roomId, joinRoom]);

  return (
    <div className="mx-auto w-full container flex flex-col justify-center max-h-screen overflow-hidden items-center">
        <RichTextEditorDemo className="w-full"/>
    </div>
  )
}