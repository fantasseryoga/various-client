import React, { useContext } from 'react'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import "../css/notification.css"
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export const NotificationMSG = ({ message }) => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const user = message.user
    const msg = message.msg
    const emptyAvatar = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));

    const navigateTo = () => {
        auth.newMessageFlag = false
        auth.newMessage = null
        navigate('/chat/' + user._id)
    }

    return (
        <>
            <div className='notification-msg-cnt d-flex'>
                {
                    user.avatar
                        ?
                        <AdvancedImage cldImg={new CloudinaryImage(user.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="user-notification-img" />
                        :
                        <AdvancedImage cldImg={emptyAvatar} className="user-notification-img" />
                }
                <div>
                    <a className='cursor-pointer comments-profile-link' role='button' onClick={navigateTo}>{user.firstName + ' ' + user.surName}</a> <br />
                    <span className='text-msg-notification'>{msg.text}</span>
                </div>
            </div>
        </>
    )
}