import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneAlt } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons'
import { useHttp } from "../hooks/http.hook"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from 'react-router-dom'
import '../css/auth.css'
import '../css/loading.css'


export const LoginPage = () => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const { loading, request } = useHttp()
    const [formErrors, setFormErrors] = useState([])
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const loginHandler = async () => {
        if (form.email === '' || form.password === '') {
            setFormErrors(['Invalid Credentials'])
            return
        }
        try {
            const response = await request("api/auth/login", "POST", { ...form })
            if (response.status === 400) {
                const data = await response.json()
                setFormErrors(data.errors.map(el => el.msg))
            }

            if (response.status === 200) {
                const data = await response.json()
                if (data.userAvatar) {
                    localStorage.setItem("avatar", JSON.stringify(data.userAvatar))
                } else {
                    localStorage.setItem("avatar", "/various/static/avatar-empty_xqyyk1")
                }

                auth.login(data.token, data.userId)
                setFormErrors([])
            }

        }
        catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    return (
        <>
            <div className='cnt-1'>
                <div className='cnt-2'>
                    <div className='container login-form'>
                        <h3 className='white-text center-align login-text'>Login</h3>
                        <div className="input-field">
                            <input placeholder="Enter your e-mail" id="email" type="text" name="email" className="validate" onChange={changeHandler} />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-field">
                            <input id="password" type="password" name="password" className="validate" onChange={changeHandler} />
                            <label htmlFor="password">Password</label>
                        </div>
                        <div>
                            <ul className="collection errors-list">
                                {
                                    formErrors.map((el, index) => {
                                        return <li key={index} className="error-item-list collection-item">&bull; {el}</li>
                                    })
                                }
                            </ul>
                        </div>
                        <a className="btn" onClick={loginHandler}>
                            {
                                loading
                                    ? <div class="load"></div>
                                    : "Sign-In"
                            }
                        </a>
                        <h5 className='auth-links center-align'><a className='a-underline cursor-pointer' role='button' onClick={() => navigate("/register")}>Sign-Up</a> / <a className='a-underline cursor-pointer' role='button'>Sign-In</a></h5>
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