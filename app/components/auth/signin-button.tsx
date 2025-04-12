"use client"
import { signIn } from "next-auth/react"
 
export function SignIn() {
  return (
    <button className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-transform transform hover:scale-105" onClick={() => signIn("google")}>
      Sign In
    </button>
  )
}