import { createContext } from "react";

function noop() {}

export const AuthContext = createContext({
    token: null,
    login: noop,
    logout: noop,
    isAuthenticated: false,
    userId: null,
    mode: "light",
    socket: null,
    newMessageFlag: false,
    newMessage: null
})