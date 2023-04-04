import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faBoxOpen, faUserGear } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons'
import { useHttp } from '../hooks/http.hook';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import '../css/side-nav.css'
import { AuthContext } from '../context/AuthContext';

export const SideNavComponent = (chat = null) => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const { request } = useHttp()
    const [categories, setCategories] = useState([])

    const navigateTo = (url) => {
        if(Object.keys(chat).length){
            auth.socket.emit('leave-chat', { chatId: chat.chat}, { token: auth.jwtToken})
        }
        navigate(url)
    }

    useEffect(() => {
        request("/api/category/get-categories", "GET").then(data => data.json()).then(
            catData => {
                setCategories(catData.categories)
            }
        )
    }, [request])

    return (
        <SideNav
            onSelect={(selected) => {
                switch (selected) {
                    case "tg":
                        window.location.href = "https://t.me/sinus_maminoy_podrugi"
                        break
                    case "inst":
                        window.location.href = "https://www.instagram.com/yehorushkin"
                        break
                    case "gh":
                        window.location.href = "https://github.com/fantasseryoga"
                        break
                    default:
                        navigateTo(selected.toLowerCase())
                }
            }}
        >
            <SideNav.Toggle />
            <SideNav.Nav>
                <NavItem eventKey="adv">
                    <NavIcon>
                        <FontAwesomeIcon icon={faCartShopping} />
                    </NavIcon>
                    <NavText>
                        Advertisements
                    </NavText>
                    <NavItem eventKey="/advertisements-list">
                        <NavText>
                            Advertisements
                        </NavText>
                    </NavItem>
                    <NavItem eventKey="/advertisements">
                        <NavText>
                            My Advertisements
                        </NavText>
                    </NavItem>
                </NavItem>
                <NavItem eventKey="categories">
                    <NavIcon>
                        <FontAwesomeIcon icon={faBoxOpen} />
                    </NavIcon>
                    <NavText>
                        Categories
                    </NavText>
                    {
                        categories.map(el => {
                            return (
                                <NavItem eventKey={"/advertisements-list/category/" + el._id} key={el._id}>
                                    <NavText>
                                        {el.name}
                                    </NavText>
                                </NavItem>
                            )
                        })
                    }
                </NavItem>
                <NavItem eventKey="contact">
                    <NavIcon>
                        <FontAwesomeIcon icon={faUserGear} />
                    </NavIcon>
                    <NavText>
                        Contact Us
                    </NavText>
                    <NavItem eventKey="inst">
                        <NavText>
                            <FontAwesomeIcon icon={faInstagram} /> Instagram
                        </NavText>
                    </NavItem>
                    <NavItem eventKey="tg">
                        <NavText>
                            <FontAwesomeIcon icon={faTelegram} /> Telegram
                        </NavText>
                    </NavItem>
                    <NavItem eventKey="gh">
                        <NavText>
                            <FontAwesomeIcon icon={faGithub} /> GitHub
                        </NavText>
                    </NavItem>
                </NavItem>
            </SideNav.Nav>
        </SideNav>
    )
}