import React from 'react'
import "quill/dist/quill.snow.css"
import { useCallback, useEffect,useRef, useState } from "react"
import Quill from "quill"




export default function TextEditor() {
    const wrapperReference= useCallback(wrapper => {
        if(wrapper==null) return
        wrapper.innerHTML=""
        const editor = document.createElement("div")
        wrapper.append(editor)
        new Quill(editor, {theme: "snow", modules:{toolbar:ToolBarArea}})
        
  }, []) 
  return <div className="container" ref={wrapperReference}></div>
  
}
const ToolBarArea = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }], //Default font used in quill
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]