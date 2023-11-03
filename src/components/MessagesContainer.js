import React from "react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { AdvancedImage } from "@cloudinary/react"
import { CloudinaryImage } from '@cloudinary/url-gen';
import { fill } from "@cloudinary/url-gen/actions/resize";

export const MessagesContainer = ({socket, currentChat, currentCompanion, dummyDivToScroll}) => {
    const navigate = useNavigate()
    const inputTextRef = useRef()
    const inputFileRef = useRef()
    const inputFilePathRef = useRef()
    const [inputText, setInputText] = useState(null)
    const [fileSend, setFileSend] = useState(null)
    const userId = useSelector(state => state.userId)
    const token = useSelector(state => state.token)

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

    const onMessageSend = event => {
        try {
            socket.emit("send-message", { chatId: currentChat._id, msg: inputTextRef.current.value, attachment: fileSend }, { token: token })
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

    const changeHandler = (event) => {
        setInputText(event.target.value)
    }

    const handleKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault()
            onMessageSend()
        }
    }

    useEffect(() => {
        dummyDivToScroll.current.scrollIntoView({ block: 'nearest' })

        return () => {console.log("leave"); socket.emit('leave-chat', { chatId: currentChat._id })}
    }, [currentChat])

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    return (
        <>
            <div className='chat-window col s8'>
                <div className='chat-header'>
                    <h5 className='center-align companion-name-chat'><a className='text-white companion-name-link' role='button' onClick={() => navigate('/profile/' + currentCompanion._id)}>{currentCompanion.firstName + " " + currentCompanion.surName}</a></h5>
                </div>
                <div className='chat-messages-cnt'>
                    {
                        currentChat.messages.length ?
                            currentChat.messages.map(el => {
                                return (
                                    <div key={el._id} className={el.createdBy === userId ? (el.read ? 'message my-message' : 'message my-message not-read') : 'message not-my-message'}>
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
                        <textarea id="chat-text" className="materialize-textarea msg-input" name='chat-text' ref={inputTextRef} maxLength={200} onChange={changeHandler} onKeyDown={handleKeyDown}></textarea>
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
                    <span>
                        <a className='btn send-message-btn' onClick={onMessageSend}>SEND</a>
                    </span>
                </div>
            </div>
        </>
    )

}