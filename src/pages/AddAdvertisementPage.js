import { React, useContext, useEffect, useState } from 'react'
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Multiselect } from 'multiselect-react-dropdown'
import { SideNavComponent } from '../components/SideNavComp'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import '../css/add-adv.css'
import { useSelector } from 'react-redux'


export const AddAdvertisementPage = () => {
    const emptyImageProduct = new CloudinaryImage('/various/products/product_empty_spnh8q', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const { loading, request } = useHttp()
    const [formErrors, setFormErrors] = useState([])
    const [optionsCity, setOptionsCity] = useState([])
    const [optionsCategory, setOptionsCategory] = useState([])
    const [optionsProducts, setOptionsProducts] = useState([])
    const [advertisement, setAdvertisement] = useState({
        title: "",
        description: "",
        city: [],
        price: null,
        categories: [],
        products: [],
        image: null
    })
    const token = useSelector(state => state.token)
    const userId = useSelector(state => state.userId)
    const newMessage = useSelector(state => state.newMessage)
    const newMessageFlag = useSelector(state => state.newMessageFlag)
    const proxy = useSelector(state => state.server)

    const addAdvertisementHandler = async () => {
        if (!advertisement.title || !advertisement.price || !advertisement.description || !advertisement.city || !advertisement.categories || !advertisement.products) {
            setFormErrors(["All fields are Mandatory"])
            return
        }

        const body = Object.fromEntries(Object.entries(advertisement).filter(([_, v]) => v != null))
        const response = await request(proxy + "/api/advertisements/create-advertisement", "POST", body, { token: token })

        if (response.status === 201) {
            alert("Advertisement has been created")
            setFormErrors([])
            return
        }

        if (response.status === 400) {
            const data = await response.json()
            setFormErrors(data.errors.map(el => el.msg))
            return
        }

        setFormErrors(["Sorry, sth went wrong"])
    }

    const changeHandler = event => {
        setAdvertisement({ ...advertisement, [event.target.name]: event.target.value })
    }

    const avatarChangeHandler = event => {
        const avatarImg = event.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(avatarImg)
        reader.onload = () => {
            setAdvertisement({ ...advertisement, image: reader.result })
        }
        reader.onerror = () => {
            alert("Your file wasn't loaded.")
        }
    }

    const changeCitiesHandler = (event) => {
        const citiesToIns = event.map(el => el.name)
        setAdvertisement({ ...advertisement, city: citiesToIns })
    }

    const changeCategoriesHandler = event => {
        const categoriesToIns = event.map(el => el.id)
        setAdvertisement({ ...advertisement, categories: categoriesToIns })
    }

    const changeProductsHandler = event => {
        const productsToIns = event.map(el => { return { product: el.id, count: 1, name: el.realName, description: el.description, createdOn: el.createdOn, image: el.image } })
        setAdvertisement({ ...advertisement, products: productsToIns })
    }

    const productQuantityHandler = event => {
        const product = event.target.name
        const count = event.target.value

        setAdvertisement({
            ...advertisement, products: advertisement.products.map(el => {
                if (el.product === product) {
                    el.count = count
                }

                return el
            })
        })
    }

    useEffect(() => {
        try{
            request(proxy + "/api/cities/get-cities").then((data => data.json())).then((val) => setOptionsCity(val.cities.map(el => el.name)))
            request(proxy + "/api/category/get-categories").then((data => data.json())).then((val) => setOptionsCategory(val.categories.map(el => {
                return { name: el.name, id: el._id }
            })))

            request(proxy + "/api/products/get-products-by-user", "POST", { userId: userId }, { token: token }).then(data => data.json()).then(productData => {
                setOptionsProducts(productData.products.map(el => {
                    const name = el.name.slice(0, 15) + '... ' + el.createdOn.slice(0, 10)
                    return { id: el._id, name: name, realName: el.name, description: el.description, createdOn: el.createdOn, image: el.image }
                }))
            })
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }, [request])

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
                            <input placeholder="Enter advertisement title" id="title" name="title" type="text" className="validate" onChange={changeHandler} />
                            <label htmlFor="title">Advertisement Title</label>
                        </div>
                        <div className="input-field col s6">
                            <input placeholder="Price" id="price" name="price" type="text" className="validate" onChange={changeHandler} />
                            <label htmlFor="price">Price</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <textarea id="description" name='description' maxLength={200} className="materialize-textarea" onChange={changeHandler}></textarea>
                            <label htmlFor="description">Description</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            < Multiselect
                                options={
                                    optionsCity.map((el, index) => {
                                        return { name: el, id: index }
                                    })
                                }
                                onSelect={changeCitiesHandler}
                                onRemove={changeCitiesHandler}
                                displayValue="name"
                                placeholder="Select Cities"
                            />
                        </div>
                        <div className="input-field col s6">
                            < Multiselect
                                options={
                                    optionsCategory
                                }
                                onSelect={changeCategoriesHandler}
                                onRemove={changeCategoriesHandler}
                                displayValue="name"
                                placeholder="Select Categories"
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='input-field col s6'>
                            < Multiselect
                                options={
                                    optionsProducts
                                }
                                onSelect={changeProductsHandler}
                                onRemove={changeProductsHandler}
                                displayValue="name"
                                placeholder="Select Products"
                            />
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
                    {
                        advertisement.products.map(el => {
                            return (
                                <div className='selcted-products-cnt' key={el.product}>
                                    <div className='row'>
                                        <div className='col s4'>
                                            {
                                                el.image
                                                    ?
                                                    <AdvancedImage cldImg={new CloudinaryImage(el.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="product-img-sm m-t-s" />
                                                    :
                                                    <AdvancedImage cldImg={emptyImageProduct} className="product-img-sm m-t-s" />
                                            }
                                        </div>
                                        <div className='col s8'>
                                            <h6>{el.name}</h6>
                                            <span className='product-desc'>
                                                {el.description}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col s8'></div>
                                        <div className='col s4'><input type="number" id="quantity" placeholder='Enter amount' name={el.product} min="1" max="10000" onChange={productQuantityHandler} /></div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div className='row'>
                        <div className='col s12'>
                            <a className='btn' onClick={addAdvertisementHandler}>
                                {
                                    loading
                                        ? <div className="load"></div>
                                        : "Create Advertisement"
                                }
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
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