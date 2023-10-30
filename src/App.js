import { useRoutes } from './router'
import { useAuth } from './hooks/auth.hook';
import { HashRouter as Router, useLocation } from 'react-router-dom'
import { useState } from 'react';
import 'materialize-css'
import { Provider } from 'react-redux';
import { ProfilePage } from './pages/ProfilePage';
import { useDispatch, useSelector } from 'react-redux'

function App() {
  const { jwtToken, login, logout, ready, userId, socket } = useAuth()
  const [newMessage, setNewMessage] = useState(null)
  const [newMessageFlag, setNewMessageFlag] = useState(false)
  const isAuthenticated = !!jwtToken
  const routes = useRoutes(isAuthenticated)
  const mode = JSON.parse(localStorage.getItem('mode'))
  const dispatch = useDispatch()
  dispatch({ type: "SET_TOKEN", payload: jwtToken })
  dispatch({ type: "SET_AUTH_FUNC", payload: { login: login, logout: logout } })
  dispatch({ type: "SET_AUTH", payload: isAuthenticated })
  dispatch({ type: "SET_USER_ID", payload: userId })
  dispatch({ type: "SET_MODE", payload: mode })
  dispatch({ type: "SET_SOCKET", payload: socket })
  dispatch({ type: "SET_MSG", payload: { newMessage: newMessage, newMessageFlag: newMessageFlag } })

  if (socket) {
    socket.on("new-message-notification", (message) => {
      setNewMessage(message)
      setNewMessageFlag(true)
    })
  }

  if (mode === "dark") {
    import('./css/dark-mode.css')
  }

  if (!ready) {
    return <div className='container'>
      <h1>Loading</h1>
    </div>
  }

  return (
      <Router className={mode === "dark" ? "dark-mode" : ""}>
        {routes}
      </Router>
  )
}

export default App;
