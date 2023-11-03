import { React, useContext, useEffect, useState } from 'react'
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { SideNavComponent } from '../components/SideNavComp'
import { Empty } from '../components/Empty'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import { useNavigate } from 'react-router-dom'
import '../css/products.css'
import { useSelector } from 'react-redux'
import { SideChat } from '../components/SideChat'


export const ProductsPage = () => {
    const emptyImage = new CloudinaryImage('/various/products/product_empty_spnh8q', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const navigate = useNavigate()
    const { request } = useHttp()
    const [empty, setEmpty] = useState(false)
    const [products, setProducts] = useState([])
    const token = useSelector(state => state.token)
    const userId = useSelector(state => state.userId)
    const newMessage = useSelector(state => state.newMessage)
    const newMessageFlag = useSelector(state => state.newMessageFlag)

    const deleteHandler = async (event) => {
        const sure = window.confirm("You sure you want to delete this item?")
        if (!sure) return

        try {
            const productId = event.target.name
            const response = await request("/api/products/delete-product", "POST", { productId: productId }, { token: token })

            if (response.status === 200) {
                alert("Product has been deleted")
                if (products.length === 1) setEmpty(true)
                setProducts(products.filter(item => item._id != productId))
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        try {
            request("/api/products/get-products-by-user", "POST", { userId: userId }, { token: token }).then(response => {
                if (response.status === 400) {
                    setEmpty(true)
                    return
                }

                return response
            }).then(data => data.json()).then(productData => {
                setProducts(productData.products)
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
                <a className='btn' onClick={() => navigate("/add-product")} >Add Products</a>
                <Empty text={"Your products list is empty."} />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <SideNavComponent />
            <a className='btn' onClick={() => navigate("/add-product")} >Add Products</a>
            {
                products.map(el => {
                    return (
                        <div className='product-container' key={el._id}>
                            <div className='product-cnt'>
                                <div className='row'>
                                    <div className='col s4'>
                                        {
                                            el.image
                                                ?
                                                <AdvancedImage cldImg={new CloudinaryImage(el.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="product-img-sm" />
                                                :
                                                <AdvancedImage cldImg={emptyImage} className="product-img-sm" />
                                        }
                                    </div>
                                    <div className='col s8'>
                                        <h6>Name: {el.name}</h6>
                                        <span className='product-desc'>
                                            Description: {el.description}
                                        </span>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col s8'></div>
                                    <div className='col s4'><a className='btn btn-delete-product' name={el._id} onClick={deleteHandler} >Delete</a></div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
            <Footer />
            <SideChat />
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