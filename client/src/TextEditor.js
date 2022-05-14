import React from 'react'
import "quill/dist/quill.snow.css"
import { useCallback, useEffect,useRef, useState } from "react"
import Quill from "quill"
import {io} from "socket.io-client"




export default function TextEditor() {

  const [socket , setSocket] = useState()
  const [quill , setQuill] = useState()
  useEffect(() => {
    const s_socket=  io("http://localhost:3001")
    setSocket(s_socket)

    return () => {
      s_socket.disconnect()
    }

  } , [])

  useEffect(() => {
    if (socket == null || quill == null) return    //check to make sure we have a socket adn a quill
    
    const socket_handler = delta => {
      quill.updateContents(delta)
    }
    socket.on("we recieve changes ", socket_handler)
    
    return () => {
    socket.off("we recieve changes ", socket_handler)
    }
    }, [socket, quill])




    const wrapperReference= useCallback(wrapper => {
        if(wrapper==null) return
        wrapper.innerHTML=""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q_quill = new Quill(editor, {theme: "snow", modules:{toolbar:ToolBarArea}})
        setQuill(q_quill)
        
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