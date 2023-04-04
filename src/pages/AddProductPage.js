import { React, useContext, useEffect, useState } from 'react'
import { AuthContext } from "../context/AuthContext"
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { SideNavComponent } from '../components/SideNavComp'
import { NotificationMSG } from '../components/Notification'
import '../css/profile.css'


export const AddProductPage = () => {
    const auth = useContext(AuthContext)
    const { loading, request } = useHttp()
    const [formErrors, setFormErrors] = useState([])
    const [product, setProduct] = useState({
        name: "",
        desctiption: "",
        image: null
    })

    const changeHandler = event => {
        setProduct({ ...product, [event.target.name]: event.target.value })
    }

    const avatarChangeHandler = event => {
        try {
            const avatarImg = event.target.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(avatarImg)
            reader.onload = () => {
                setProduct({ ...product, image: reader.result })
            }
            reader.onerror = () => {
                alert("Your file wasn't loaded.")
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const addProductHandler = async () => {
        try {
            if (product.name === "" || product.image === "") {
                setFormErrors(["Image and Name are Mandatory"])
                return
            }

            const body = Object.fromEntries(Object.entries(product).filter(([_, v]) => v != null))
            const response = await request("api/products/create-product", "POST", body, { token: auth.jwtToken })

            if (response.status === 201) {
                alert("Product has been created")
                setFormErrors([])
                return
            }

            if (response.status === 400) {
                const data = await response.json()
                setFormErrors(data.errors.map(el => el.msg))
                return
            }

            setFormErrors(["Sorry, sth went wrong"])
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    return (
        <>
            <Navbar />
            <SideNavComponent />
            <div className='profile-container'>
                <div className='profile-cnt'>
                    <div className='row'>
                        <div className="input-field col s6">
                            <input placeholder="Enter product name" id="name" name="name" type="text" className="validate" onChange={changeHandler} />
                            <label htmlFor="name">Product Name</label>
                        </div>
                        <div className="file-field input-field col s6">
                            <div className="btn btn-upload">
                                <span>Image</span>
                                <input type="file" onChange={avatarChangeHandler} />
                            </div>
                            <div className="file-path-wrapper">
                                <input className="file-path validate" type="text" />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <textarea id="description" name='description' maxLength={200} className="materialize-textarea" onChange={changeHandler}></textarea>
                            <label htmlFor="description">Description</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col s12'>
                            <ul className="collection errors-list">
                                {
                                    formErrors.map((el, index) => {
                                        return <li key={index} className="collection-item error-item-list">&bull; {el}</li>
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col s12'>
                            <a className='btn' onClick={addProductHandler}>
                                {
                                    loading
                                        ? <div className="load"></div>
                                        : "Add Product"
                                }
                            </a>
                        </div>
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