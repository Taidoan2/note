import React from 'react'
import { getInitials } from '../../utils/helper'
import { useNavigate } from "react-router-dom";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const handleLogout = () => {

    // Điều hướng về trang login
    navigate("/"); // Đảm bảo route /login đã được cấu hình trong App.js
  };
  return (
    <div className='flex items-center gap-3'>
        <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
           {getInitials("Tài Đoàn")} 
            </div>
    <div>
    <p className='text-sm font-medium'>Tài Đoàn</p>
    <button className='text-sm text-slate-700 underline hover:text-red-600' onClick={handleLogout}>Logout</button>
    </div>
    </div>
  )
}

export default ProfileInfo