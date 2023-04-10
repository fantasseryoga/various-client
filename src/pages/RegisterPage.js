import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneAlt } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons'
import { useHttp } from "../hooks/http.hook"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import '../css/auth.css'
import '../css/loading.css'


export const RegisterPage = () => {
    const navigate = useNavigate()
    const { loading, request } = useHttp()
    const [optionsCity, setOptionsCity] = useState([])
    const [formErrors, setFormErrors] = useState([])
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        surName: '',
        phoneNumber: '',
        city: '',
        passwordR: ''
    })

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const registerHandler = async () => {
        try {
            if (form.email === '' || form.password === '' || form.firstName === '' || form.surName === '' || form.phoneNumber === '' || form.city === '' || form.passwordR === '') {
                setFormErrors(["All fields are mandatory"])
                return
            } else {
                const index = formErrors.indexOf("All fields are mandatory");
                if (index > -1) {
                    formErrors.splice(index, 1);
                }
            }
            if (form.password != form.passwordR) {
                if (formErrors.includes("Password mismatch")) {
                    return
                }
                setFormErrors([...formErrors, "Password mismatch"])

                return
            }
            const response = await request("/api/auth/register", "POST", { ...form })


            if (response.status === 400) {
                const data = await response.json()
                setFormErrors(data.errors.map(el => el.msg))
            }

            if (response.status === 201) {
                const data = await response.json()
                setFormErrors([])

                alert('User has been created')

                navigate('/')
            }

        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    useEffect(() => {
        try{
            fetch("/api/cities/get-cities").then((data => data.json())).then((val) => setOptionsCity(val.cities.map(el => el.name)))
        } catch (e) {
            setOptionsCity(["Lviv", "Kyiv", "Kharkiv"])
        }
    })

    return (
        <>
            <div className='cnt-1'>
                <div className='cnt-2'>
                    <div className='container registration-form'>
                        <h3 className='white-text center-align login-text'>Registration</h3>
                        <div className='row'>
                            <div className="input-field col s6">
                                <input placeholder="Enter your first name" id="first_name" name="firstName" type="text" className="validate" onChange={changeHandler} />
                                <label htmlFor="first_name">First Name</label>
                            </div>
                            <div className="input-field col s6">
                                <input placeholder="Enter your last name" id="last_name" name="surName" type="text" className="validate" onChange={changeHandler} />
                                <label htmlFor="last_name">Last Name</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s12">
                                <input placeholder="Enter your e-mail" id="email" name="email" type="text" className="validate" onChange={changeHandler} />
                                <label htmlFor="email">Email</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s6">
                                <input placeholder="Enter your phone number" name="phoneNumber" id="phone" type="tel" className="validate" onChange={changeHandler} />
                                <label htmlFor="phone">Phone</label>
                            </div>
                            <div className="input-field col s6">
                                <select id='sel' defaultValue={0} name='city' onChange={changeHandler}>
                                    <option value={0} disabled>Select City</option>
                                    {
                                        optionsCity.map(el => {
                                            return (
                                                <option key={el} value={el}>{el}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="input-field col s6">
                                <input id="password" type="password" name="password" className="validate" onChange={changeHandler} />
                                <label htmlFor="password">Password</label>
                            </div>
                            <div className="input-field col s6">
                                <input id="passwordR" type="password" name="passwordR" className="validate" onChange={changeHandler} />
                                <label htmlFor="passwordR">Repeat Password</label>
                            </div>
                        </div>
                        <div>
                            <ul className="collection errors-list">
                                {
                                    formErrors.map((el, index) => {
                                        return <li key={index} className="collection-item error-item-list">&bull; {el}</li>
                                    })
                                }
                            </ul>
                        </div>
                        <a className="btn" onClick={registerHandler}>
                            {
                                loading
                                    ? <div class="load"></div>
                                    : "Sign-Up"
                            }
                        </a>
                        <h5 className='auth-links center-align'><a className='a-underline cursor-pointer' role='button'>Sign-Up</a> / <a className='a-underline cursor-pointer' role='button' onClick={() => navigate("/")}>Sign-In</a></h5>
                    </div>
                    <div className='cnt-3 white-text center-align'>
                        <FontAwesomeIcon icon={faTelegram} className="favicon" />
                        <FontAwesomeIcon icon={faInstagram} className="favicon" />
                        <FontAwesomeIcon icon={faGithub} className="favicon" />
                        <FontAwesomeIcon icon={faPhoneAlt} className="favicon" />
                    </div>
                </div>
            </div>
        </>
    )
}