"use client";

import { Button } from "@/components/ui/button";
import { generateRoomName } from "@/lib/generateRoomName";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  const router = useRouter();
  const {data: session} = useSession();
  // console.log("room page session", session);
  

  const handleCreateRoom = () => {
    try{
      const roomName = generateRoomName();
      // console.log(roomName);
      localStorage.setItem("roomId", roomName);
      if (session?.user?.email) {
        localStorage.setItem("userEmail", session.user.email);
        localStorage.setItem("userRole", 'admin');
      } else {
        console.error("User email is undefined or null");
      }
      // console.log("roomId", localStorage.getItem("roomId"));
      // alert(roomName);
      router.push(`/editor/${roomName}`);
    } catch(e){
      alert("Error has occured");
      console.log("erro while generating room", e);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Rooms</h1>
          <Button
            onClick={handleCreateRoom}
            className="bg-white text-black cursor-pointer hover:bg-gray-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Room
          </Button>
        </div>
        
        {/* Room list will be added here in the future */}
        <div className="grid gap-4">
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <p className="text-gray-400">
              No rooms yet. Create your first room to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}