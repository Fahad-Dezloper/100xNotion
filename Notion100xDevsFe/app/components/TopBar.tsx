"use client"
import { useSession } from "next-auth/react"
import React from 'react';
import { SignIn } from "./auth/signin-button";
import { SignOut } from "./auth/signout-button";

const TopBar = () => {
    const {data: session} = useSession();
    //  console.log("session here", session?.user?.id);
    
    return (
        <div className="w-full flex items-center justify-center py-4">
        <div className="flex justify-between  w-fit gap-36 items-center p-4 px-8 bg-black/60 border-b  rounded-full shadow-md">
            <div className="text-xl font-bold ">100xNotion</div>
            <div className="flex justify-center gap-2 items-center">
                {session ? <SignOut /> : <SignIn />}
            </div>
        </div>
        </div>
    );
};

export default TopBar;