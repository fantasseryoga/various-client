import { React, useContext, useEffect, useState } from 'react'
import { AuthContext } from "../context/AuthContext"
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Rating } from 'react-simple-star-rating'
import { SideNavComponent } from '../components/SideNavComp'
import { Empty } from '../components/Empty'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import 'react-tabs/style/react-tabs.css';
import '../css/advertisement.css'


export const AdvertisementPage = () => {
    const emptyAvatar = new CloudinaryImage('/various/static/avatar-empty_xqyyk1', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const emptyImage = new CloudinaryImage('/various/products/product_empty_spnh8q', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const auth = useContext(AuthContext)
    const avatarUser = JSON.parse(localStorage.getItem("avatar"))
    const userData = JSON.parse(localStorage.getItem("userData"))
    const advIdParam = useParams().id
    const navigate = useNavigate()
    const { loading, request } = useHttp()
    const [advComments, setAdvComments] = useState([])
    const [advRatings, setAdvRatings] = useState([])
    const [rating, setRating] = useState(0)
    const [commentText, setCommentText] = useState()
    const [ratingText, setRatingText] = useState()
    const [advertisement, setAdvertisement] = useState({
        createdOn: "",
        title: "",
        description: "",
        price: null,
        rating: null,
        ratingCount: null,
        ratingValue: null,
        status: "",
        advProducts: [],
        advCategories: [],
        advCities: [],
        advComments: [],
        user: ""
    })

    const handleRating = (rate) => {
        setRating(rate)
    }

    const handleRate = async () => {
        try {
            if (!rating) {
                alert("You should set the value for stars")
                return
            }

            const sure = window.confirm("You can rate advertisement only once. This action can't be undone.")
            if (!sure) return

            const response = await request("/api/ratings/create-rating", "POST", { ratingValue: rating, advertisementId: advIdParam, text: ratingText }, { token: auth.jwtToken })

            if (response.status === 400) {
                alert("You already rated this advertisement")
                return
            }

            if (response.status === 201) {
                alert("Rated Succesfully")

                setAdvRatings([{
                    text: ratingText,
                    rating: rating,
                    createdOn: "Just Now",
                    createdBy: {
                        firstName: "You",
                        surName: "",
                        _id: userData.userId,
                        avatar: avatarUser
                    }
                }, ...advRatings])
                return
            }

            alert("Sth went wrong, try again.")
            return
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeCommentHandler = event => {
        setCommentText(event.target.value)
    }

    const changeRatingTextHandler = event => {
        setRatingText(event.target.value)
    }

    const commentHandler = async () => {
        try {
            const response = await request("/api/comments/create-comment", "POST", { text: commentText, advertisementId: advIdParam }, { token: auth.jwtToken })

            if (response.status === 201) {
                const data = await response.json()
                const comment = data.comment
                setAdvComments([{
                    text: comment.text,
                    _id: comment._id,
                    createdOn: comment.createdOn,
                    createdBy: {
                        firstName: "You",
                        surName: "",
                        _id: userData.userId,
                        avatar: avatarUser
                    }
                }, ...advComments])
                return
            }

            alert("Sry, sth went wrong")
            return
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const deleteCommentandler = async (event) => {
        try {
            const commentId = event.target.name

            const sure = window.confirm("You sure you want to delete this comment?")
            if (!sure) return

            const response = await request("/api/comments/delete-comment", "POST", { commentId: commentId }, { token: auth.jwtToken })

            if (response.status === 400) {
                alert("You dont have such permission.")
                return
            }

            if (response.status === 200) {
                alert("Comment has been deleted")
                setAdvComments(advComments.filter(item => item._id != commentId))
                return
            }

            alert("Sth went wrong, try again.")
            return
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        try {
            request("/api/advertisements/get-advertisement-by-id", "POST", { advertisementId: advIdParam }, { token: auth.jwtToken }).then(data => data.json()).then(advData => {
                setAdvertisement(advData.advertisement)
                setAdvComments(advData.advertisement.advComments)
                setAdvRatings(advData.advertisement.advRatings)
            })
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }, [request])

    return (
        <>
            <Navbar />
            <SideNavComponent />
            <div className='advertisement-page-container'>
                <div className='advertisement-page-cnt'>
                    <div className='row'>
                        <div className='col s5'>
                            {
                                advertisement.image
                                    ?
                                    <AdvancedImage cldImg={new CloudinaryImage(advertisement.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="adv-img" />
                                    :
                                    <AdvancedImage cldImg={emptyImage} className="adv-img" />
                            }
                        </div>
                        <div className='col s7'>
                            <div className='row d-flex j-c-b rating-title'>
                                <h5>{advertisement.title}</h5>
                                <div className='rating-stars'>
                                    <div className='stars'>
                                        {
                                            Array.from(Array(advertisement.rating).keys()).map(el => {
                                                return (
                                                    < FontAwesomeIcon icon={faStar} key={el} className="star-checked" />
                                                )
                                            })
                                        }
                                        {
                                            Array.from(Array(5 - advertisement.rating).keys()).map(el => {
                                                return (
                                                    < FontAwesomeIcon icon={faStar} key={el} className="star-unchecked" />
                                                )
                                            })
                                        }
                                    </div>
                                    rates: {advertisement.ratingCount}
                                </div>
                            </div>
                            <div className='row'>
                                <span className='adv-desc'>
                                    {advertisement.description}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='row adv-info'>
                        <div className='col s4'>
                            <span className='text-shadow'>Cost:</span> <span className='info-value'>{advertisement.price}</span>
                        </div>
                        <div className='col s4'>
                            <span className='text-shadow'>Status:</span> <span className='info-value'>{advertisement.status}</span>
                        </div>
                        <div className='col s4'>
                            <span className='text-shadow'>Date:</span> <span className='info-value'>{advertisement.createdOn.slice(0, 10)}</span>
                        </div>
                    </div>
                    <div className='row adv-info d-flex j-c-b'>
                        <div className='col s4'>
                            <span className='text-shadow'>Categories:</span>
                            <ul>
                                {
                                    advertisement.advCategories.map(el => {
                                        return (
                                            <li key={el._id} className='category-li'>&bull; <a role='button' onClick={() => navigate('/advertisements-list/category/' + el._id)} className='category-link cursor-pointer'>{el.name}</a></li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        <div className='col s4'>
                            <span className='text-shadow'>City:</span>
                            <ul>
                                {
                                    advertisement.advCities.map(el => {
                                        return (
                                            <li key={el.name} className='category-li'>&bull; <a role='button' onClick={() => navigate('/advertisements-list/city/' + el.name)} className='category-link cursor-pointer'>{el.name}</a></li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        <div className='col s4'>
                            <span className='text-shadow'>Creator: </span>
                            {
                                <a className='comments-profile-link cursor-pointer' role='button' onClick={() => navigate('/profile/' + advertisement.user._id)}>{advertisement.user.firstName + ' ' + advertisement.user.surName}</a>
                            }

                        </div>
                    </div>
                    <hr />
                    <h5 className='center-align text-shadow-title'>Products</h5>
                    <div className='row products-adv'>
                        {
                            advertisement.advProducts.map(el => {
                                return (
                                    <div className='adv-product d-flex' key={el.product._id}>
                                        {
                                            el.product.image
                                                ?
                                                <AdvancedImage cldImg={new CloudinaryImage(el.product.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="adv-product-img-sm mr-sm" />
                                                :
                                                <AdvancedImage cldImg={emptyImage} className="adv-product-img-sm mr-sm" />
                                        }
                                        <div className='w-100'>
                                            <h6>{el.product.name}</h6>
                                            <span>{el.product.description}</span>
                                            <h6 className='right-align'>Count: {el.count}</h6>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <hr />
                    <div className="row tabs-custom">
                        <Tabs>
                            <TabList>
                                <Tab className="react-tabs__tab tab">Comments</Tab>
                                <Tab className="react-tabs__tab tab">Ratings</Tab>
                            </TabList>

                            <TabPanel>
                                <div className="row">
                                    <h5 className='text-shadow center-align'>Leave your Comment</h5>
                                    <form className="col s10 enter-comment-field">
                                        <div className="row">
                                            <div className="input-field col s12">
                                                <textarea id="textarea1" className="materialize-textarea" maxLength={200} onChange={changeCommentHandler}></textarea>
                                                <label htmlFor="textarea1">Leave your comment</label>
                                            </div>
                                        </div>
                                    </form>
                                    <div className='col s2 comment-btn'>
                                        <a className="waves-effect waves-light btn m-t" onClick={commentHandler}>
                                            {
                                                loading
                                                    ? <div className="load"></div>
                                                    : "Send"
                                            }
                                        </a>
                                    </div>
                                </div>
                                {
                                    advComments.length ?
                                        advComments.map(el => {
                                            return (
                                                <div className='row comments-cnt' key={el._id}>
                                                    <div className='col s1 comment-img'>
                                                        {
                                                            el.createdBy.avatar
                                                                ?
                                                                <AdvancedImage cldImg={new CloudinaryImage(el.createdBy.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="user-comment-img" />
                                                                :
                                                                <AdvancedImage cldImg={emptyAvatar} className="user-comment-img" />
                                                        }
                                                    </div>
                                                    <div className='col s11 user-comment-info'>
                                                        <div className='d-flex j-c-b'>
                                                            <a className='comments-profile-link cursor-pointer' role='button' onClick={() => navigate('/profile/' + el.createdBy._id)}>{el.createdBy.firstName + ' ' + el.createdBy.surName}</a>
                                                            <span>{el.createdOn.slice(0, 10)}</span>
                                                        </div>
                                                        <div className='d-flex j-c-b'>
                                                            <span className='f-w'>
                                                                {el.text}
                                                            </span>
                                                            {
                                                                el.createdBy._id === userData.userId
                                                                    ? <a className='btn btn-delete-comment' name={el._id} onClick={deleteCommentandler}>Delete</a>
                                                                    : ""
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                            )
                                        }) :
                                        <Empty text={"No comments yet."} />
                                }
                            </TabPanel>
                            <TabPanel>
                                <div className="row">
                                    <h5 className='text-shadow center-align'>Rate this advertisement</h5>
                                    <form class="col s8 rate-input">
                                        <div className="row rating-form">
                                            <div className="input-field col s12 rating-input">
                                                <textarea id="textarea1" className="materialize-textarea" onChange={changeRatingTextHandler} maxLength={200}></textarea>
                                                <label htmlFor="textarea1">Leave comment {"(optional)"}</label>
                                            </div>
                                        </div>
                                    </form>
                                    <div className='col s2 rate-stars-input'>
                                        <Rating
                                            className='m-t'
                                            onClick={handleRating}
                                            size={21}
                                        />
                                    </div>
                                    <div className='col s2 rate-btn'>
                                        <a className="waves-effect waves-light btn m-t" onClick={handleRate}>
                                            {
                                                loading
                                                    ? <div className="load"></div>
                                                    : "Rate"
                                            }
                                        </a>
                                    </div>
                                </div>
                                {
                                    advRatings.length ?
                                        advRatings.map(el => {
                                            return (
                                                <div className='row comments-cnt' key={el._id}>
                                                    <div className='col s1 comment-img'>
                                                        {
                                                            el.createdBy.avatar
                                                                ?
                                                                <AdvancedImage cldImg={new CloudinaryImage(el.createdBy.avatar, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="user-comment-img" />
                                                                :
                                                                <AdvancedImage cldImg={emptyAvatar} className="user-comment-img" />
                                                        }
                                                    </div>
                                                    <div className='col s11 user-comment-info'>
                                                        <div className='d-flex j-c-b'>
                                                            <a className='comments-profile-link cursor-pointer' role='button' onClick={() => navigate('/profile/' + el.createdBy._id)}>{el.createdBy.firstName + ' ' + el.createdBy.surName}</a>
                                                            <span>{el.createdOn.slice(0, 10)}</span>
                                                        </div>
                                                        <div className='d-flex j-c-b comment-text-btn-cnt'>
                                                            <span className='f-w'>
                                                                {el.text}
                                                            </span>
                                                            <div className='rating-value-users'>
                                                                {
                                                                    Array.from(Array(el.rating).keys()).map(el => {
                                                                        return (
                                                                            < FontAwesomeIcon icon={faStar} key={el} className="star-checked" />
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
                                                        </div>
                                                    </div>
                                                </div>

                                            )
                                        }) :
                                        <Empty text={"No Ratings yet."} />
                                }
                            </TabPanel>
                        </Tabs>
                    </div>
                </div>
            </div>
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