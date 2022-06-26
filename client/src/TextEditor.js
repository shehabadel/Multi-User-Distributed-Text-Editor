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
  const [users, setUsers] = useState(1)
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

  useEffect(() => {
    if (newsocket == null || quill == null) return
    newsocket.on('connect', () => {
      newsocket.emit('get-document')
      newsocket.emit('get-users')
    })
    return () => {
      newsocket.off('connect', () => {
      })
    }
  }, [])

  useEffect(() => {
    if (newsocket == null || quill == null) return
    newsocket.on('users-no', (noOfSubs) => {
      console.log(noOfSubs)
    })
    return () => {
      newsocket.off('users-no', (noOfSubs) => {
      })
    }
  }, [newsocket, quill])

  //UseEffect2
  useEffect(() => {
    if (newsocket == null || quill == null) return

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
    newsocket.emit("get-users", id_doc)
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

  //Intervally check number of users
  useEffect(() => {
    if (newsocket == null || quill == null) return

    const time_interval = setInterval(() => {
      newsocket.emit('get-users')
    }, interval_ms)

    return () => {
      clearInterval(time_interval)
    }
  }, [newsocket, quill])

  //When client disconnects
  useEffect(() => {
    if (newsocket == null || quill == null) return

    const empty_handler = (error) => {
      quill.disable()
      quill.setText(error)
    }
    newsocket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        empty_handler("Server is down, please try again later")
        newsocket.connect();
      }
      else if (reason==='transport close'||reason==='io client disconnect')
      {
        empty_handler("Disconnected, Please retry again!") // false
      }
      else{
        newsocket.connect()
      }
    });

    return () => {
      newsocket.off("disconnect", empty_handler)
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
  
  return(
    <>
    <div className="container" ref={wrapperReference}></div>
    </>
  )



}


const ToolBarArea = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }], //Default font used in quill
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: ['#ffffff', 'orange'] }, { background: ['#ffffff'] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]