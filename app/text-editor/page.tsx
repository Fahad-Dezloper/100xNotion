import { RichTextEditorDemo } from "@/components/tiptap/rich-text-editor";

export default function Page() {

  return (
    <div className="mx-auto w-full container flex flex-col justify-center max-h-screen overflow-hidden items-center">
        <RichTextEditorDemo className="w-full"/>
    </div>
  )
}
