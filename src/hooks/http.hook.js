import { useState, useCallback, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useHttp = () => {
    const auth = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true)

        try {
            if (body) {
                body = JSON.stringify(body)
                headers['Content-Type'] = 'application/json'
                headers['Accept'] = 'application/json'
            }

            const response = await fetch(url, { method, body, headers })

            setLoading(false)

            if (response.status === 401) {
                auth.logout()
            }

            return response
        } catch (e) {
            setLoading(false)
            setError(e.message)

            throw e
        }
    }, [])

    const clearError = useCallback(() => setError(null))

    return { loading, request, error, clearError }
}