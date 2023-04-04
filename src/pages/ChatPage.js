import { React, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from "../context/AuthContext"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useNavigate, useParams } from 'react-router-dom'
import { SideNavComponent } from '../components/SideNavComp'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import '../css/chat.css'


export const ChatPage = () => {
    const emptyAvatar = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const auth = useContext(AuthContext)
    const userIdParam = useParams().userId
    const navigate = useNavigate()
    const dummyDivToScroll = useRef()
    const inputTextRef = useRef()
    const inputFileRef = useRef()
    const inputFilePathRef = useRef()
    const [inputText, setInputText] = useState(null)
    const [fileSend, setFileSend] = useState(null)
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState({
        createdBy: null,
        companion: null,
        name: null,
        messages: [],
        _id: null
    })
    const [currentCompanion, setCurrentCompanion] = useState({
        firstName: "",
        surName: "",
        _id: null
    })

    const [connected, setConnected] = useState(auth.socket ? auth.socket.connected : false)
    if(!connected){
        auth.socket.on('connected', () => { setConnected(true) })
    }
    
    const changeHandler = (event) => {
        setInputText(event.target.value)
    }

    const onMessageSend = event => {
        try {
            auth.socket.emit("send-message", { chatId: currentChat._id, msg: inputTextRef.current.value, attachment: fileSend }, { token: auth.jwtToken })
            setInputText("")
            setFileSend(null)
            inputTextRef.current.value = ""
            inputFileRef.current.value = null
            inputFilePathRef.current.value = null
        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const fileAttachmentHandler = event => {
        try {
            const fileAttachment = event.target.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(fileAttachment)
            reader.onload = () => {
                setFileSend(reader.result)
            }
            reader.onerror = () => {
                alert("Your file wasn't loaded.")
            }
        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const selectChatHandler = (event) => {
        try {
            const chatId = event.target.name
            auth.socket.emit('join-chat', { chatId: chatId }, { token: auth.jwtToken })
        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const configureSocket = () => {
        try {
            auth.socket.on('get-chats', chats => {
                if (chats.chats) {
                    setChats(chats.chats)
                    chats.chats.forEach(el => {
                        if (el.current) {
                            setCurrentChat(el)
                            setCurrentCompanion(el.companion)
                        }
                    });
                }
            })

            auth.socket.on('join-chat', chat => {
                if (chat.chat) {
                    setCurrentChat(chat.chat)
                    setCurrentCompanion(chat.companion)

                    const newChats = chats.map(el => {
                        el.current = false
                        if (el._id === chat.chat._id) {
                            el.current = true
                        }
                        return el
                    })

                    setChats(newChats)
                }
            })

            auth.socket.on('send-message', message => {
                if (message.message) {
                    console.log(message.message)
                    setCurrentChat({ ...currentChat, messages: [...currentChat.messages, message.message] })
                }
            })

            auth.socket.on('companion-entered', () => {
                const readMessages = currentChat.messages.map(el => {
                    if (!el.read) el.read = true
                    return el
                })
                setCurrentChat({ ...currentChat, messages: readMessages })
            })
        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        if(connected){
            if (userIdParam) {
                auth.socket.emit("get-chats", { profileId: userIdParam }, { token: auth.jwtToken })
            } else {
                auth.socket.emit("get-chats", { profileId: null }, { token: auth.jwtToken })
            }
        }
    }, [connected])

    useEffect(() => {
        if(connected){
            configureSocket()
            dummyDivToScroll.current.scrollIntoView({ block: 'nearest' })
        }
    }, [currentChat, chats, connected])

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    return (
        <>
            <Navbar chat={currentChat._id} />
            <SideNavComponent chat={currentChat._id} />
            <div className='chat'>
                <div className='row chat-navigation-row'>
                    <div className='chat-navigation col s4'>
                        <h5 className='text-shadow text-chat'>Chats</h5>
                        {
                            !chats.length
                                ?
                                <h4 className='empty-chats-text'>No Chats here..</h4>
                                :
                                null
                        }
                        {
                            chats.map(el => {
                                return (
                                    <div key={el.name} className={el.current ? "selected-chat chat-item d-flex" : "chat-item d-flex"} >
                                        {
                                            el.companion.avatar
                                                ?
                                                <AdvancedImage cldImg={new CloudinaryImage(el.companion.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="user-chat-img" />
                                                :
                                                <AdvancedImage cldImg={emptyAvatar} className="user-chat-img" />
                                        }
                                        <div>
                                            <a className='chat-profile-name' href='#' name={el._id} onClick={selectChatHandler}>{el.name}</a> <br /><br />
                                            <span className='text-unread-messages-chat-item'>{el.unread ? "New Messages" : ""}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='chat-window col s8'>
                        <div className='chat-header'>
                            <h5 className='center-align companion-name-chat'><a className='text-white companion-name-link' role='button' onClick={() => navigate('/profile/' + currentCompanion._id)}>{currentCompanion.firstName + " " + currentCompanion.surName}</a></h5>
                        </div>
                        <div className='chat-messages-cnt'>
                            {
                                currentChat.messages.length ?
                                    currentChat.messages.map(el => {
                                        return (
                                            <div key={el._id} className={el.createdBy === auth.userId ? (el.read ? 'message my-message' : 'message my-message not-read') : 'message not-my-message'}>
                                                {
                                                    el.attachment
                                                        ?
                                                        <div>
                                                            <AdvancedImage cldImg={new CloudinaryImage("various/messages/" + el.attachment, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="adv-img" />
                                                            <br />{el.text} <br />
                                                            <span className='time-message'>{el.createdOn.slice(0, 10) + " " + el.createdOn.slice(11, 16)}</span>
                                                        </div>
                                                        :
                                                        <>
                                                            {el.text} < br />
                                                            <span className='time-message'>{el.createdOn.slice(0, 10) + " " + el.createdOn.slice(11, 16)}</span>
                                                        </>

                                                }
                                            </div>
                                        )
                                    })
                                    :
                                    <h3 className='empty-messages-text'>No Messages Here..</h3>
                            }
                            <div style={{ float: "left", clear: "both" }}
                                ref={dummyDivToScroll}>
                            </div>
                        </div>
                        <div className='chat-footer d-flex j-c-b'>
                            <div className="input-field chat-input">
                                <textarea id="chat-text" className="materialize-textarea msg-input" name='chat-text' ref={inputTextRef} maxLength={200} onChange={changeHandler}></textarea>
                                <label htmlFor="chat-text">Enter Message</label>
                            </div>
                            <div className="file-field message-attachment-input input-field">
                                <div className="btn btn-upload msg-file-uploader">
                                    <span>File</span>
                                    <input type="file" ref={inputFileRef} accept="image/png, image/gif, image/jpeg" onChange={fileAttachmentHandler} />
                                </div>
                                <div className="file-path-wrapper">
                                    <input className="file-path validate msg-input" ref={inputFilePathRef} type="text" />
                                </div>
                            </div>
                            <a className='btn send-message-btn' onClick={onMessageSend}>SEND</a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}