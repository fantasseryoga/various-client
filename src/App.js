import { useRoutes } from './router'
import { AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/auth.hook';
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { useState } from 'react';
import 'materialize-css'


function App() {
  const { jwtToken, login, logout, ready, userId, socket } = useAuth()
  const [newMessage, setNewMessage] = useState(null)
  const [newMessageFlag, setNewMessageFlag] = useState(false)
  const isAuthenticated = !!jwtToken
  const routes = useRoutes(isAuthenticated)
  const mode = JSON.parse(localStorage.getItem('mode'))

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
    <AuthContext.Provider value={{
      jwtToken, login, logout, isAuthenticated, userId, mode, socket, newMessageFlag, newMessage
    }}>
      <Router className={mode === "dark" ? "dark-mode" : ""}>
        {routes}
      </Router>
    </AuthContext.Provider>
  )
}

export default App;
