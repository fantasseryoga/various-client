import { React, useContext, useEffect, useState } from 'react'
import { AuthContext } from "../context/AuthContext"
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { SideNavComponent } from '../components/SideNavComp'
import { Empty } from '../components/Empty'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import '../css/user-adv.css'


export const AdvertisementsPage = () => {
    const emptyImage = new CloudinaryImage('/various/products/product_empty_spnh8q', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const auth = useContext(AuthContext)
    const userIdParam = useParams().id
    const navigate = useNavigate()
    const { request } = useHttp()
    const [self, setSelf] = useState(false)
    const [empty, setEmpty] = useState(false)
    const [advertisements, setAdvertisements] = useState([])

    const deleteHandler = async (event) => {
        try {
            const sure = window.confirm("You sure you want to delete this advertisement?")
            if (!sure) return

            const advId = event.target.name

            const response = await request("/api/advertisements/delete-advertisement", "POST", { advertisementId: advId }, { token: auth.jwtToken })

            if (response.status === 200) {
                alert("Advertisement has been deleted")
                if (advertisements.length === 1) setEmpty(true)
                setAdvertisements(advertisements.filter(item => item._id != advId))
                return
            }

            if (response.status === 400) {
                alert("Seems like you don't have a permission to delete this item")
                return
            }

            return
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeStatusHandler = async (event) => {
        try {
            const advId = event.target.name
            const status = advertisements.filter(item => item._id === advId)[0].status
            const newStatus = status === "active" ? "unactive" : "active"

            const response = await request("/api/advertisements/change-status", "POST", { advertisementId: advId, status: newStatus }, { token: auth.jwtToken })

            if (response.status === 200) {
                alert("Status was changed")
                setAdvertisements(advertisements.map(el => {
                    if (el._id === advId) el.status = newStatus

                    return el
                }))
                return
            }

            if (response.status === 400) {
                alert("Seems like you don't have a permission to change status of this item")
                return
            }

            return
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        try {
            const userId = userIdParam ? userIdParam : auth.userId

            request("/api/advertisements/get-advertisements", "POST", { userId: userId }, { token: auth.jwtToken }).then(response => {
                if (response.status === 400) {
                    setEmpty(true)
                    if (!userIdParam) {
                        setSelf(true)
                    }
                    return
                }
                return response

            }).then(data => data.json()).then(advData => {
                setAdvertisements(advData.advertisements)
                setSelf(advData.self)
            })
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }, [request])

    if (empty) {
        return (
            <>
                <Navbar />
                <SideNavComponent />
                {
                    self
                        ? <a className='btn' onClick={() => navigate('/add-advertisement')} >Create Advertisement</a>
                        : null
                }
                <Empty text="Your advertisements list is epmty." />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <SideNavComponent />
            {
                self
                    ? <a className='btn' onClick={() => navigate('/add-advertisement')} >Create Advertisement</a>
                    : null
            }
            {
                advertisements.map(el => {
                    return (
                        <div className='profile-container' key={el._id}>
                            <div className='profile-cnt'>
                                <div className='row'>
                                    <div className='col s4'>
                                        {
                                            el.image
                                                ?
                                                <AdvancedImage cldImg={new CloudinaryImage(el.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="adv-img-sm" />
                                                :
                                                <AdvancedImage cldImg={emptyImage} className="adv-img-sm" />
                                        }
                                    </div>
                                    <div className='col s8'>
                                        {
                                            self
                                                ? <h6>{el.title}</h6>
                                                : <h6><a className="city-link" href={'/advertisement/' + el._id}>{el.title}</a></h6>
                                        }
                                        <span className='product-desc'>
                                            {el.description}
                                        </span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col s4'>
                                        Cost: <span className='info-value'>{el.price}</span>
                                    </div>
                                    <div className='col s4'>
                                        Rating:
                                        {
                                            Array.from(Array(el.rating).keys()).map(el => {
                                                return (
                                                    < FontAwesomeIcon icon={faStar} className="star-checked" key={el}/>
                                                )
                                            })
                                        }
                                        {
                                            Array.from(Array(5 - el.rating).keys()).map(el => {
                                                return (
                                                    < FontAwesomeIcon icon={faStar} key={el} className="star-unchecked" />
                                                )
                                            })
                                        }

                                    </div>
                                    <div className='col s4'>
                                        Created: <span className='info-value'>{el.createdOn.slice(0, 10)}</span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col s6'>
                                        Categories:
                                        {
                                            el.categories.map(el => {
                                                return (
                                                    <span className='info-value' key={el._id}>&bull; <a className='category-link' href={'/advertisements-list/category/' + el._id}>{el.name}</a></span>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className='col s6'>
                                        City:
                                        {
                                            el.cities.map(el => {
                                                return (
                                                    <span className='info-value' key={el._id}>&bull; <a className='city-link' href={'/advertisements-list/city/' + el.name}>{el.name}</a></span>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                {
                                    self
                                        ?
                                        <div className='row'>
                                            <div className='col s4'><a className='btn' onClick={() => navigate('/advertisement/' + el._id)}>Check</a></div>
                                            <div className='col s4'>{
                                                el.status === "active"
                                                    ? <a className='btn change-status-unactive' onClick={changeStatusHandler} name={el._id}>Set Unactive</a>
                                                    : <a className='btn change-status-active' onClick={changeStatusHandler} name={el._id}>Set active</a>
                                            }</div>
                                            <div className='col s4'><a className='btn btn-delete-product' name={el._id} onClick={deleteHandler} >Delete</a></div>
                                        </div>
                                        : null
                                }
                            </div>
                        </div>
                    )
                })
            }
            <Footer />
            {
                auth.newMessageFlag
                    ?
                    <NotificationMSG message={auth.newMessage} />
                    :
                    ""
            }
        </>
    )
}