import { useState, useCallback, useEffect } from 'react'
import socketIO from "socket.io-client"
import { useDispatch, useSelector } from 'react-redux'
const SERVER = ""

const storageName = 'userData'

export const useAuth = () => {
    const [jwtToken, setJwtToken] = useState(null)
    const [ready, setReady] = useState(false)
    const [socket, setSocket] = useState(null)
    const [userId, setUserId] = useState(null)
    const dispatch = useDispatch()


    const login = useCallback((jwt, userId) => {
        setJwtToken(jwt)
        setUserId(userId)
        dispatch({type: "SET_TOKEN", payload: jwt})
        dispatch({type: "SET_USER_ID", payload: userId})
        localStorage.setItem(storageName, JSON.stringify({
            token: jwt,
            userId: userId
        }))
    }, [])

    const logout = useCallback(() => {
        setSocket(null)
        setJwtToken(null)
        setUserId(null)
        dispatch({type: "SET_TOKEN", payload: null})
        dispatch({type: "SET_USER_ID", payload: null})
        alert("Succesfully loged out")
        localStorage.removeItem(storageName)
        localStorage.removeItem("socket")
    }, [])

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(storageName))

        if (data && data.token) {
            login(data.token, data.userId)
            const socketIo = socketIO.connect(SERVER, { auth: { token: data.token } })
            setSocket(socketIo)
        }

        setReady(true)
    }, [login, jwtToken])

    return { login, logout, jwtToken, ready, userId, socket }
}