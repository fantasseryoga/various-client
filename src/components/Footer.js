import React from 'react'
import '../css/footer.css'


export const Footer = () => {
    return (
        <>
            <footer className="page-footer">
                <div className="container">
                    <div className="row">
                        <div className="col l6 s12">
                            <h5 className="white-text">Various</h5>
                            <p className="grey-text text-lighten-4">It's a place where you can find everything you wanted and needed. You have opportunity to create your own advertisements and sell whatever you need to.</p>
                        </div>
                        <div className="col l4 offset-l2 s12">
                            <h5 className="white-text">Usefull Links</h5>
                            <ul>
                                <li><a className="grey-text text-lighten-3" href="#">About Us</a></li>
                                <li><a className="grey-text text-lighten-3" href="https://t.me/sinus_maminoy_podrugi">Telegram</a></li>
                                <li><a className="grey-text text-lighten-3" href="https://github.com/fantasseryoga">GitHub</a></li>
                                <li><a className="grey-text text-lighten-3" href="https://www.instagram.com/yehorushkin">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-copyright">
                    <div className="container">
                        © 2023 Ukraine Lviv
                        <a className="grey-text text-lighten-4 right" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Click Here</a>
                    </div>
                </div>
            </footer>
        </>

    )
}