import { createRef, React, useContext, useEffect, useState, componentDidUpdate, useRef } from 'react'
import { useHttp } from "../hooks/http.hook"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { Multiselect } from 'multiselect-react-dropdown'
import { Empty } from '../components/Empty'
import ReactPaginate from 'react-paginate'
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize";
import { CloudinaryImage } from '@cloudinary/url-gen';
import { NotificationMSG } from '../components/Notification'
import '../css/list-adv.css'
import { useSelector } from 'react-redux'
import { SideChat } from '../components/SideChat'


export const AllAdvertisementsPage = () => {
    const emptyImage = new CloudinaryImage('/various/products/product_empty_spnh8q', { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250));
    const categoryId = useParams().categoryId
    const cityName = useParams().cityName
    const navigate = useNavigate()
    const { request } = useHttp()
    const multiselectRef = createRef()
    const [notInitialRender, setNotInitialRender] = useState(false)
    const [advertisements, setAdvertisements] = useState([])
    const [optionsCity, setOptionsCity] = useState([])
    const [optionsCategory, setOptionsCategory] = useState([])
    const [pageCount, setPageCount] = useState(0)
    const [page, setPage] = useState(0)
    const [term, setTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState(term);
    const [form, setForm] = useState({
        byRating: false,
        byDate: true,
        title: null,
        categories: null,
        cities: null,
        priceMin: null,
        priceMax: null,
        page: 0
    })
    const token = useSelector(state => state.token)
    const newMessage = useSelector(state => state.newMessage)
    const newMessageFlag = useSelector(state => state.newMessageFlag)

    const liveSearch = async () => {
        try {
            const body = Object.fromEntries(Object.entries(form).filter(([_, v]) => v != null))
            body.page = 0

            await request("/api/advertisements/get-advertisements-by-filter", "POST", body, { token: token }).then(res => {
                if (res.status === 200) {
                    return res.json()
                }
                return { advertisements: [] }
            }).then(
                data => {
                    setAdvertisements(data.advertisements)
                    setPageCount(data.pageCount)
                }
            )
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeCheckBoxHandler = event => {
        try {
            if (event.target.name === "byRating") {
                setForm({ ...form, ["byDate"]: !event.target.checked, ["byRating"]: event.target.checked })
                setDebouncedTerm(event.target.checked + "byRate")
                return
            }

            if (event.target.name === "byDate") {
                setForm({ ...form, ["byRating"]: !event.target.checked, ["byDate"]: event.target.checked })
                setDebouncedTerm(event.target.checked + "byDate")
                return
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeCitiesHandler = (event) => {
        try {
            if (!event.length) {
                setForm({ ...form, cities: null })
                setDebouncedTerm("city")
                return
            }
            const citiesToIns = event.map(el => el.name)
            setForm({ ...form, cities: citiesToIns })

            setDebouncedTerm(event)
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeCategoriesHandler = event => {
        try {
            if (!event.length) {
                setForm({ ...form, categories: null })
                setDebouncedTerm("cat")
                return
            }
            const categoriesToIns = event.map(el => el.id)
            setForm({ ...form, categories: categoriesToIns })

            setDebouncedTerm(event.map(el => el._id))
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const handlePageClick = event => {
        setForm({ ...form, page: event.selected })
        setPage(event.selected)
    }

    const changeHandler = event => {
        try {
            if (event.target.value === "") {
                setForm({ ...form, [event.target.name]: null })
                setDebouncedTerm("title")
                return
            }
            setForm({ ...form, [event.target.name]: event.target.value })

            setDebouncedTerm(event.target.value)
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => setTerm(debouncedTerm), 1000);
        return () => clearTimeout(timer);
    }, [debouncedTerm])

    useEffect(() => {
        if (term !== '') {
            liveSearch();
        }
    }, [term]);

    useEffect(() => {
        if (notInitialRender) {
            window.location.reload(false)
        } else {
            setNotInitialRender(true)
        }
    }, [categoryId, cityName])

    useEffect(() => {
        try {
            let body = Object.fromEntries(Object.entries(form).filter(([_, v]) => v != null))
            body.page = page
            if (categoryId && !notInitialRender) {
                setForm({ ...form, categories: [categoryId] })
                body.categories = [categoryId]
                body.page = page
            }
            if (cityName && !notInitialRender) {
                setForm({ ...form, cities: [cityName] })
                body.cities = [cityName]
                body.page = page
            }
            request("/api/advertisements/get-advertisements-by-filter", "POST", body, { token: token }).then(response => {
                if (response.status === 400) {
                    return
                }
                return response

            }).then(data => data.json()).then(advData => {
                setAdvertisements(advData.advertisements)
                setPageCount(advData.pageCount)
            })
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }, [request, categoryId, page])

    useEffect(() => {
        try {
            request("/api/cities/get-cities").then((data => data.json())).then((val) => setOptionsCity(val.cities.map(el => el.name)))

            request("/api/category/get-categories").then((data => data.json())).then((val) => setOptionsCategory(val.categories.map(el => {
                return { name: el.name, id: el._id }
            })))
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
            <div className='form-filter-cnt'>
                <h5 className='text-shadow center-align white-text m-b'>Search</h5>
                <div className='row'>
                    <div className="input-field col s8">
                        <input placeholder="Title" id="title" name="title" type="text" className="validate" onChange={changeHandler} />
                        <label htmlFor="title">Start entering what you want to find</label>
                    </div>
                    <div className="input-field col s4">
                        {
                            categoryId ?
                                < Multiselect
                                    ref={multiselectRef}
                                    options={
                                        optionsCategory
                                    }
                                    selectedValues={optionsCategory.filter(el => el.id === categoryId)}
                                    onSelect={changeCategoriesHandler}
                                    onRemove={changeCategoriesHandler}
                                    displayValue="name"
                                    placeholder="Select Categories"
                                />
                                :
                                < Multiselect
                                    ref={multiselectRef}
                                    options={
                                        optionsCategory
                                    }
                                    onSelect={changeCategoriesHandler}
                                    onRemove={changeCategoriesHandler}
                                    displayValue="name"
                                    placeholder="Select Categories"
                                />
                        }
                    </div>
                </div>
                <div className='row'>
                    <div className="input-field col s4 filter-cost">
                        <input placeholder="Minimal cost" id="priceMin" name="priceMin" type="number" className="validate" max={1000000} min={0} onChange={changeHandler} />
                        <label htmlFor="priceMin">Minimal cost of advertisement</label>
                    </div>
                    <div className="input-field col s4 filter-cost">
                        <input placeholder="Maximum cost" id="priceMax" name="priceMax" type="number" className="validate" max={1000000} min={0} onChange={changeHandler} />
                        <label htmlFor="priceMax">Maximum cost of advertisement</label>
                    </div>
                    <div className="input-field col s4 filter-city-multiselect">
                        {
                            cityName ?
                                < Multiselect
                                    options={
                                        optionsCity.map((el) => {
                                            return { name: el, id: el }
                                        })
                                    }
                                    selectedValues={[{ id: cityName, name: cityName }]}
                                    onSelect={changeCitiesHandler}
                                    onRemove={changeCitiesHandler}
                                    displayValue="name"
                                    placeholder="Select Cities"
                                />
                                :
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
                        }
                    </div>
                </div>
                <div className='row'>
                    <div className='col s2 filtering-check-box'>
                        <label htmlFor='by-rating'>
                            <input type="checkbox" className="filled-in" checked={form.byRating} id='by-rating' name='byRating' onChange={changeCheckBoxHandler} />
                            <span>By rating</span>
                        </label>
                    </div>
                    <div className='col s2 filtering-check-box'>
                        <label htmlFor='by-date'>
                            <input type="checkbox" className="filled-in" checked={form.byDate} id='by-date' name='byDate' onChange={changeCheckBoxHandler} />
                            <span>By date</span>
                        </label>
                    </div>
                </div>
            </div>
            {
                advertisements.length ?
                    advertisements.map(el => {
                        return (
                            <div className='advertisement-container' key={el._id}>
                                <div className='advertisement-cnt'>
                                    <div className='row'>
                                        <div className='col s4 adv-img-cnt'>
                                            {
                                                el.image
                                                    ?
                                                    <AdvancedImage cldImg={new CloudinaryImage(el.image, { cloudName: 'deelxfjof' }).resize(fill().width(250).height(250))} className="product-img-lg" />
                                                    :
                                                    <AdvancedImage cldImg={emptyImage} className="product-img-lg" />
                                            }
                                        </div>
                                        <div className='col s8'>
                                            <h6><a className="city-link cursor-pointer" role='button' onClick={() => navigate('/advertisement/' + el._id)}>{el.title}</a></h6>
                                            <span className='product-desc'>
                                                {el.description}
                                            </span>
                                            <div className='m-t-l'>
                                                <div className='row'>
                                                    <div className='col s4 adv-cost'>
                                                        Cost: <span className='info-value'>{el.price}</span>
                                                    </div>
                                                    <div className='col s4'>
                                                        Rating:
                                                        {
                                                            Array.from(Array(el.rating).keys()).map((el, index) => {
                                                                return (
                                                                    < FontAwesomeIcon icon={faStar} key={index} className="star-checked" />
                                                                )
                                                            })
                                                        }
                                                        {
                                                            Array.from(Array(5 - el.rating).keys()).map((el, index) => {
                                                                return (
                                                                    < FontAwesomeIcon icon={faStar} key={index} className="star-unchecked" />
                                                                )
                                                            })
                                                        }

                                                    </div>
                                                    <div className='col s4'>
                                                        Created: <span className='info-value'>{el.createdOn.slice(0, 10)}</span>
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className='col s6 adv-categories-list'>
                                                        Categories:
                                                        {
                                                            el.categories.map(el => {
                                                                return (
                                                                    <span className='info-value' key={el._id}>&bull; <a className='category-link cursor-pointer' role='button' >{el.name}</a></span>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                    <div className='col s6 adv-cities-list'>
                                                        City:
                                                        {
                                                            el.cities.map(el => {
                                                                return (
                                                                    <span className='info-value' key={el._id}>&bull; <a className='city-link cursor-pointer' role='button' >{el.name}</a></span>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }) :
                    <Empty text={"No advertisements here."} />
            }
            <div className='advertisement-container'>
                <ReactPaginate
                    className='d-flex center-align pagination-ul'
                    breakLabel="..."
                    nextLabel="Next"
                    previousLabel="Prev"
                    renderOnZeroPageCount={0}
                    pageRangeDisplayed={2}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                />
            </div>
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