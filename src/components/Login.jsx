import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { getApiUrl } from '../config/api'
import API_ENDPOINTS from '../config/api'

const Login = ({ setToken }) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }
        
        try {
            setLoading(true)
            const response = await axios.post(
                getApiUrl(API_ENDPOINTS.AUTH.ADMIN_LOGIN),
                { email, password }
            )
            
            if (response.data.success) {
                setToken(response.data.token)
                toast.success('Login successful')
            } else {
                toast.error(response.data.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error(error.response?.data?.message || error.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
            <form onSubmit={onSubmitHandler}>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                        type="email" 
                        placeholder='your@email.com' 
                        required 
                        disabled={loading}
                    />
                </div>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                        type="password" 
                        placeholder='Enter your password' 
                        required 
                        disabled={loading}
                    />
                </div>
                <button 
                    className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black disabled:bg-gray-400 disabled:cursor-not-allowed' 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    </div>
  )
}

export default Login
