import { React, useContext, useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useHttp } from '../hooks/http.hook'
import { SideNavComponent } from '../components/SideNavComp'
import { NotificationMSG } from '../components/Notification'
import '../css/settings.css'
import { useDispatch, useSelector } from 'react-redux'


export const SettingsPage = () => {
    const mode = useSelector(state => state.mode)
    if (mode === "dark") {
        import('../css/dark-mode.css')
    }
    const { loading, request } = useHttp()
    const [optionsCity, setOptionsCity] = useState([])
    const [modeP, setMode] = useState(mode)
    const [formErrors, setFormErrors] = useState([])
    const [user, setUser] = useState({
        firstName: "",
        surName: "",
        phoneNumber: "",
        avatar: "",
        city: "",
        online: "",
        since: ""
    })
    const [form, setForm] = useState({
        password: null,
        firstName: null,
        surName: null,
        phoneNumber: null,
        city: null,
        newPassword: null,
        avatar: null
    })
    const dispatch = useDispatch()
    const token = useSelector(state => state.token)
    const logout = useSelector(state => state.logout)
    const userId = useSelector(state => state.userId)
    const newMessage = useSelector(state => state.newMessage)
    const newMessageFlag = useSelector(state => state.newMessageFlag)

    const updateHandler = async () => {
        if (!form.password) {
            if (formErrors.includes("Enter your password")) {
                return
            }
            setFormErrors(["Enter your password"])

            return
        }

        try {
            const body = Object.fromEntries(Object.entries(form).filter(([_, v]) => v != null));
            const response = await request("/api/users/update-user", "POST", body, { token: token })
            if (response.status === 200) {
                const data = await response.json()
                localStorage.setItem("avatar", JSON.stringify(data.user.avatar))
                alert("User has been updated")
            }

            if (response.status === 400) {
                const data = await response.json()
                setFormErrors(data.errors.map(el => el.msg))
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const deleteHandler = async () => {
        let sure = window.confirm("Are you sure you want to delete this account?")
        if (!sure) {
            return
        }

        try {
            const response = await request("/api/users/deactivate-user", "POST", { userId: userId }, { token: token })
            if (response.status === 200) {
                alert("This account has been deleated")
                logout()
            } else {
                alert("Something went wrong")
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const avatarChangeHandler = event => {
        try {
            const avatarImg = event.target.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(avatarImg)
            reader.onload = () => {
                setForm({ ...form, avatar: reader.result })
            }
            reader.onerror = () => {
                alert("Your file wasn't loaded.")
            }
        } catch (e) {
            console.log(e)
            alert("Sorry sth went wrong, try to reload the page.")
        }
    }

    const modeHandler = event => {
        const sure = window.confirm("If you change the mode page will be refreshed, you sure?")
        if(!sure) return

        if (modeP === "dark") {
            dispatch({type: "SET_MODE", payload: "light"})
            localStorage.setItem("mode", JSON.stringify("light"))
            setMode("light")
        } else {
            dispatch({type: "SET_MODE", payload: "dark"})
            setMode("dark")
            localStorage.setItem("mode", JSON.stringify("dark"))
        }

        window.location.reload(false);

    }

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    useEffect(() => {
        try {
            fetch("api/cities/get-cities").then((data => data.json())).then((val) => setOptionsCity(val.cities.map(el => el.name)))

            const userIdP = userId
            request("/api/users/get-profile", "POST", { userId: userIdP }, { token: token }).then(data => data.json()).then(userData => {
                setUser(userData.profile)
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
            <div className='profile-container'>
                <div className='profile-cnt'>
                    <div className='row'>
                        <div className="input-field col s6">
                            <input placeholder="Enter your first name" id="first_name" name="firstName" type="text" className="validate" defaultValue={user.firstName} onChange={changeHandler} />
                            <label htmlFor="first_name">First Name</label>
                        </div>
                        <div className="input-field col s6">
                            <input placeholder="Enter your last name" id="last_name" name="surName" type="text" className="validate" defaultValue={user.surName} onChange={changeHandler} />
                            <label htmlFor="last_name">Last Name</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="input-field col s6">
                            <input placeholder="Enter your phone number" name="phoneNumber" id="phone" defaultValue={user.phoneNumber} type="tel" className="validate" onChange={changeHandler} />
                            <label htmlFor="phone">Phone</label>
                        </div>
                        <div className="input-field col s6">
                            <select id='sel' name='city' onChange={changeHandler}>
                                <option key={user.city} value={user.city} selected>{user.city}</option>
                                {
                                    optionsCity.map(el => {
                                        if (el === user.city) return
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
                            <label htmlFor="password">Password {'(Needed for changes)'}</label>
                        </div>
                        <div className="input-field col s6">
                            <input id="newPassword" type="password" name="newPassword" className="validate" onChange={changeHandler} />
                            <label htmlFor="newPassword">New Password</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="file-field input-field">
                            <div className="btn btn-upload">
                                <span>Avatar</span>
                                <input type="file" onChange={avatarChangeHandler} />
                            </div>
                            <div className="file-path-wrapper">
                                <input className="file-path validate" type="text" />
                            </div>
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
                    <a className="btn" onClick={updateHandler}>
                        {
                            loading
                                ? <div className="load"></div>
                                : "Update"
                        }
                    </a>
                </div>
            </div>
            <div className='profile-container'>
                <div className='profile-cnt'>
                    <div className='row main-btns-row'>
                        <div className='col s4'>
                            <a className='btn' onClick={logout}>Logout</a>
                        </div>
                        <div className='col s4 align-center'>
                            <a className={modeP === "dark" ? 'btn swtch-mode-light' : 'btn swtch-mode-dark'} onClick={modeHandler}>{modeP === "dark" ? "light" : "dark"}</a>
                        </div>
                        <div className='col s4'>
                            <a className='btn delete-acc' onClick={deleteHandler}>Terminate</a>
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