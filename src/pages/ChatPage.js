import { React, useContext, useEffect, useRef, useState } from 'react'
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useParams } from 'react-router-dom'
import { SideNavComponent } from '../components/SideNavComp'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import '../css/chat.css'
import { useSelector } from 'react-redux'
import { MessagesContainer } from '../components/MessagesContainer'


export const ChatPage = () => {
    const emptyAvatar = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const userIdParam = useParams().userId
    const dummyDivToScroll = useRef()
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
    const token = useSelector(state => state.token)
    const socket = useSelector(state => state.socket)

    const [connected, setConnected] = useState(socket ? socket.connected : false)
    if (!connected) {
        socket.on('connected', () => { setConnected(true) })
    }

    const selectChatHandler = (event) => {
        try {
            const chatId = event.target.name
            socket.emit('join-chat', { chatId: chatId }, { token: token })
        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const configureSocket = () => {
        try {
            socket.on('get-chats', chats => {
                if (chats.chats) {
                    setChats(chats.chats)
                    chats.chats.forEach(el => {
                        if (el.current) {
                            setCurrentChat(el)
                            setCurrentCompanion(el.companion)
                        }
                    });
                    // console.log(currentCompanion)
                }
            })

            socket.on('join-chat', chat => {
                if (chat.chat) {
                    setCurrentChat(chat.chat)
                    setCurrentCompanion(chat.companion)
                    const newChats = chats.map(el => {
                        el.current = false
                        if (el._id === chat.chat._id) {
                            el.current = true
                            el.unread = false
                        }
                        return el
                    })

                    setChats(newChats)
                }
            })

            socket.on('send-message', message => {
                if (message.message) {
                    setCurrentChat({ ...currentChat, messages: [...currentChat.messages, message.message] })
                }
            })

            socket.on('companion-entered', () => {
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
        if (connected) {
            if (userIdParam) {
                socket.emit("get-chats", { profile: { profileId: userIdParam } }, { token: token })
            } else {
                socket.emit("get-chats", { profile: { profileId: null } }, { token: token })
            }
        }

    }, [connected])

    useEffect(() => {
        if (connected) {
            configureSocket()
            dummyDivToScroll.current.scrollIntoView({ block: 'nearest' })
        }
    }, [currentChat, chats, connected])

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
                                            <a className='chat-profile-name cursor-pointer' role='button' name={el._id} onClick={selectChatHandler}>{el.name}</a> <br /><br />
                                            <span className='text-unread-messages-chat-item'>{el.unread ? "New Messages" : ""}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <MessagesContainer socket={socket} currentChat={currentChat} currentCompanion={currentCompanion} dummyDivToScroll={dummyDivToScroll} />
                </div>
            </div>

            <Footer />
        </>
    )
}