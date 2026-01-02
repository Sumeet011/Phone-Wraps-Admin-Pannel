import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { validateEmail, validatePassword } from '../utils/validation'

const Login = ({setToken}) => {

    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.post(backendUrl + '/api/auth/admin',{email,password})
            if (response.data.success) {
                setToken(response.data.token)
                toast.success('Login successful!')
            } else {
                toast.error(response.data.message)
            }
             
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage)
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full'>
            <h1 className='text-2xl font-bold mb-4 text-center text-gray-800'>Admin Panel</h1>
            <p className='text-sm text-gray-600 text-center mb-6'>Sign in to access the dashboard</p>
            <form onSubmit={onSubmitHandler}>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                    <input 
                        onChange={(e)=>{
                            setEmail(e.target.value);
                            setErrors({...errors, email: ''});
                        }} 
                        value={email} 
                        className={`rounded-md w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-blue-500`}
                        type="email" 
                        placeholder='your@email.com'
                        disabled={loading}
                    />
                    {errors.email && <p className='text-xs text-red-500 mt-1'>{errors.email}</p>}
                </div>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                    <input 
                        onChange={(e)=>{
                            setPassword(e.target.value);
                            setErrors({...errors, password: ''});
                        }} 
                        value={password} 
                        className={`rounded-md w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-blue-500`}
                        type="password" 
                        placeholder='Enter your password'
                        disabled={loading}
                    />
                    {errors.password && <p className='text-xs text-red-500 mt-1'>{errors.password}</p>}
                </div>
                <button 
                    className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center' 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </>
                    ) : 'Login'}
                </button>
            </form>
        </div>
    </div>
  )
}

export default Login
