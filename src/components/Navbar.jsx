import React, { useState } from 'react'
import {assets} from '../assets/assets'
import ConfirmDialog from './ConfirmDialog'

const Navbar = ({setToken}) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
  }

  return (
    <>
      <div className='flex items-center py-2 px-[4%] justify-between'>
          <span className='text-2xl font-bold'>PhoneWraps Admin</span>
          <button 
            onClick={() => setShowLogoutDialog(true)} 
            className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-700 transition'
          >
            Logout
          </button>
      </div>
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        type="warning"
      />
    </>
  )
}

export default Navbar