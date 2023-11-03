import React from "react";
import { useState, useEffect, useRef } from "react";
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import '../css/side-chat.css'
import { useSelector } from "react-redux";
import { MessagesContainer } from '../components/MessagesContainer'

export const SideChat = () => {
    const emptyAvatar = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(100).height(100));
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
    const dummyDivToScroll = useRef()
    const socket = useSelector(state => state.socket)
    const token = useSelector(state => state.token)
    const [connected, setConnected] = useState(socket ? socket.connected : false)
    const [chatSelected, setChatSelected] = useState(false)

    if (!connected) {
        socket.on('connected', () => { setConnected(true) })
    }

    const configureSocket = () => {
        socket.on('get-chats', chats => {
            if (chats.chats) {
                setChats(chats.chats)
            }
        })

        socket.on('join-chat', chat => {
            if (chat.chat) {
                setCurrentChat(chat.chat)
                setCurrentCompanion(chat.companion)
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

    const openChat = (event) => {
        setChatSelected(true)
        const chatId = event.target.name
        socket.emit('join-chat', { chatId: chatId }, { token: token })
    }

    const backToChats = (event) => {
        setChatSelected(false)
        socket.emit('leave-chat', { chatId: currentChat._id })
        setCurrentChat({
            createdBy: null,
            companion: null,
            name: null,
            messages: [],
            _id: null
        })
        setCurrentCompanion({
            firstName: "",
            surName: "",
            _id: null
        })
    }

    useEffect(() => {
        if (connected) {
            configureSocket()
            socket.emit("get-chats", { profile: { profileId: null }, limit: 5 }, { token: token })
        }
    }, [connected, currentChat])


    return (
        <>
            {
                chatSelected ?
                    <div className="side-chat-msg-cnt">
                        <a class="waves-effect waves-light btn" onClick={backToChats}>back</a>
                        <MessagesContainer socket={socket} currentChat={currentChat} currentCompanion={currentCompanion} dummyDivToScroll={dummyDivToScroll} />
                    </div>
                    :
                    <div className="side-chat-cnt">
                        {
                            chats.map(el => {
                                return (
                                    <div className="side-chat-item d-flex" key={el._id} >
                                        {
                                            el.companion.avatar
                                                ?
                                                <AdvancedImage cldImg={new CloudinaryImage(el.companion.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(100).height(100))} className="user-side-chat-img" />
                                                :
                                                <AdvancedImage cldImg={emptyAvatar} className="user-side-chat-img" />
                                        }
                                        <div className="side-chat-item-user-info">
                                            <a className='side-chat-profile-name cursor-pointer white-text no-wrap-txt' role='button' name={el._id} onClick={openChat}>{el.name}</a><br />
                                            <span className='text-unread-messages-chat-item no-wrap-txt'>{el.unread ? "New Messages" : ""}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
            }
        </>
    )
} 