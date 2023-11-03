import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

function noop() {}

const defaultState = {
    token: null,
    server: "http://52.54.180.43:5000",
    login: noop,
    logout: noop,
    isAuthenticated: false,
    userId: null,
    mode: "light",
    socket: null,
    newMessageFlag: false,
    newMessage: null
}

const reducer = (state = defaultState, action) => {
    if (action.type === "SET_TOKEN") {
        return { ...state, token: action.payload }
    }

    if(action.type === "SET_AUTH_FUNC") {
        return {...state, login: action.payload.login, logout: action.payload.logout}
    }

    if(action.type === "SET_AUTH") {
        return {...state, isAuthenticated: action.payload}
    }

    if(action.type === "SET_USER_ID") {
        return {...state, userId: action.payload}
    }

    if(action.type === "SET_MODE") {
        return {...state, mode: action.payload}
    }

    if(action.type === "SET_SOCKET") {
        return {...state, socket: action.payload}
    }

    if(action.type === "SET_MSG") {
        return {...state, newMessage: action.payload.newMessage, newMessageFlag: action.payload.newMessageFlag}
    }

    return state
}

const store = createStore(reducer)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

reportWebVitals();
