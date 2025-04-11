"use client";
import TopBar from "./components/TopBar";
import RoomPage from "./components/CreateRoom";
import Hero from "./components/Hero";
import { useSession } from "next-auth/react";

export default function Home() {
  // const session = await
  const {data: session } = useSession();
  

  return (
    <div className="bg-[#171717] h-screen overflow-hidden">
      {/* TopBar */}
      <TopBar />
    
    {/* if session dont exist */}
    {/* hero text */}
    {/* screen pullover */}

    {/* if session exist */}

    {session?.user ? <RoomPage /> : <Hero />}

   </div>
  );
}
