import React from 'react'
import "quill/dist/quill.snow.css"
import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"

const interval_ms = 2000


export default function TextEditor() {
  const { id: id_doc } = useParams()
  const [newsocket, setSocket] = useState()
  const [quill, setQuill] = useState()

  console.log(id_doc)


  //UseEffect1
  useEffect(() => {
    //Setting a random name for the socket user connected
    const r = Math.floor(Math.random() * 10) + 1
    const s_socket = io(process.env.REACT_APP_SERVER_URL, { query: { username: `shehab ${r}` } })
    setSocket(s_socket)

    return () => {
      s_socket.disconnect()
    }

  }, [])


  //UseEffect2
  useEffect(() => {
    if (newsocket == null || quill == null) return    //check to make sure we have a socket adn a quill

    const socket_handler = delta => {
      quill.updateContents(delta)
    }
    newsocket.on("receive-changes", socket_handler)

    return () => {
      newsocket.off("receive-changes ", socket_handler)
    }
  }, [newsocket, quill])


  //UseEffect3
  useEffect(() => {
    if (newsocket == null || quill == null) return

    const socket_handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      newsocket.emit("send-changes", delta)
    }
    quill.on("text-change", socket_handler)

    return () => {
      quill.off("text-change", socket_handler)
    }
  }, [newsocket, quill])

  //useEffect4
  useEffect(() => {
    if (newsocket == null || quill == null) return

    newsocket.once("load-document", document_loaded => {
      quill.setContents(document_loaded)
      quill.enable()
    })

    newsocket.emit("get-document", id_doc)
  }, [newsocket, quill, id_doc])

  //useEffect5
  useEffect(() => {
    if (newsocket == null || quill == null) return

    const time_interval = setInterval(() => {
      newsocket.emit("save-document", quill.getContents())
    }, interval_ms)

    return () => {
      clearInterval(time_interval)
    }
  }, [newsocket, quill])

  const wrapperReference = useCallback(wrapper => {
    if (wrapper == null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q_quill = new Quill(editor, { theme: "snow", modules: { toolbar: ToolBarArea } })
    q_quill.disable()
    q_quill.setText("Loading............")
    setQuill(q_quill)

  }, [])
  return <div className="container" ref={wrapperReference}></div>


}


const ToolBarArea = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }], //Default font used in quill
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: ['#ffffff','orange'] }, { background: ['#ffffff'] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]