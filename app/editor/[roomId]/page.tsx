"use client"
import { RichTextEditorDemo } from "@/components/tiptap/rich-text-editor";

export default function Page() {

  // const roomId = localStorage.getItem("roomId");
  // const userId = localStorage.getItem("userEmail");
  // console.log("roomId", roomId);
  // console.log("userId", userId);

  return (
    <div className="mx-auto w-full container flex flex-col justify-center max-h-screen overflow-hidden items-center">
        <RichTextEditorDemo className="w-full"/>
    </div>
  )
}