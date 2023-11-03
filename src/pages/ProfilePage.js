import { React, useContext, useEffect, useState } from 'react'
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneAlt, faEarthAmerica, faCity, faAddressCard } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { SideNavComponent } from '../components/SideNavComp'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import '../css/profile.css'
import { useDispatch, useSelector } from 'react-redux'
import { SideChat } from '../components/SideChat'


export const ProfilePage = () => {
    const emptyImage = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const userIdParam = useParams().id
    const navigate = useNavigate()
    const { loading, request } = useHttp()
    const [self, setSelf] = useState(false)
    const [user, setUser] = useState({
        firstName: "",
        surName: "",
        phoneNumber: "",
        avatar: "",
        city: "",
        online: "",
        since: "",
        avatar: null
    })
    const token = useSelector(state => state.token)
    const userId = useSelector(state => state.userId)
    const newMessage = useSelector(state => state.newMessage)
    const newMessageFlag = useSelector(state => state.newMessageFlag)

    useEffect(() => {
        const userIdP = userIdParam ? userIdParam : userId

        try {
            request("/api/users/get-profile", "POST", { userId: userIdP }, { token: token }).then(data => data.json()).then(userData => {
                setUser(userData.profile)
                setSelf(userData.self)
            })
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }, [request, userIdParam])

    if (loading) {
        return (
            <>
                <Navbar />
                <SideNavComponent />
                <Loader />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <SideNavComponent />
            <div className='profile-container'>
                <div className='profile-cnt'>
                    <div className='row'>
                        <div className='col s6'>
                            {
                                user.avatar
                                    ?
                                    <AdvancedImage cldImg={new CloudinaryImage(user.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="avatar" />
                                    :
                                    <AdvancedImage cldImg={emptyImage} className="avatar" />
                            }
                        </div>
                        <div className='col s6'>
                            <h5 className='center-align user-name'>{user.firstName + ' ' + user.surName}</h5>
                            <h6 className='user-info'>
                                <span><FontAwesomeIcon icon={faCity} className="favicon" /></span>
                                <span>{user.city}</span>
                            </h6>
                            <h6 className='user-info'>
                                <span><FontAwesomeIcon icon={faPhoneAlt} className="favicon" /></span>
                                <span>{user.phoneNumber}</span>
                            </h6>
                            <h6 className='user-info'>
                                <span><FontAwesomeIcon icon={faAddressCard} className="favicon" /></span>
                                <span>{user.since.slice(0, 10)}</span>
                            </h6>
                            <h6 className='user-info'>
                                <span><FontAwesomeIcon icon={faEarthAmerica} className="favicon" /></span>
                                <span>{user.online ? "online" : "offline"}</span>
                            </h6>
                        </div>
                    </div>
                    <hr />
                    <div className='profile-actions'>
                        {
                            !self
                                ?
                                <div className='row'>
                                    <div className='col s4'>
                                        <a className='btn' onClick={() => navigate("/chat/" + userIdParam)}>Send Message</a>
                                    </div>
                                    <div className='col s4'>
                                        <a className='btn' onClick={() => navigate("/advertisements/" + userIdParam)}>Show Adv</a>
                                    </div>
                                    <div className='col s4'>
                                        <a className='btn'>Like</a>
                                    </div>
                                </div>
                                :
                                <div className='row'>
                                    <div className='col s4'>
                                        <a className='btn' onClick={() => navigate("/settings")}>Settings</a>
                                    </div>
                                    <div className='col s4'>
                                        <a className='btn' onClick={() => navigate("/advertisements")}>My Adv</a>
                                    </div>
                                    <div className='col s4'>
                                        <a className='btn' onClick={() => navigate("/products")}>My Products</a>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
            <Footer />
            <SideChat/>
            {
                newMessageFlag
                    ?
                    <NotificationMSG message={newMessage} />
                    :
                    ""
            }
        </>
    )
}