"use client"
import { signOut } from "next-auth/react"
 
export function SignOut() {
  return <button className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-transform transform hover:scale-105" onClick={() => signOut()}>Sign Out</button>
}