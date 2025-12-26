import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Coupons from './pages/Coupons'
import BlogsRich from './pages/BlogsRich'
import DesignAssets from './pages/DesignAssets'
import SiteSettings from './pages/SiteSettings'
import CollectionTooltips from './pages/CollectionTooltips'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//export const backendUrl = "https://phone-wraps-backend.onrender.com"
export const backendUrl = import.meta.env.VITE_BACKEND_URL
console.log("Backend URL:", backendUrl);
export const currency = '$'


const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/orders/:orderId' element={<OrderDetails token={token} />} />
                <Route path='/coupons' element={<Coupons token={token} />} />
                <Route path='/blogs' element={<BlogsRich token={token} />} />
                <Route path='/design-assets' element={<DesignAssets token={token} />} />
                <Route path='/site-settings' element={<SiteSettings token={token} />} />
                <Route path='/collection-tooltips' element={<CollectionTooltips token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App
