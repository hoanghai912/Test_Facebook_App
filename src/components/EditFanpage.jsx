/* eslint-disable react/prop-types */
import axios from 'axios';
import { useState } from 'react';

const EditFanpage = ({fanpageDetail}) => {
  const [notification, setNotification] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const website = e.target[2].value;
    const phone = e.target[3].value;
    const email = e.target[4].value;
    const contact_address = e.target[5].value;
    const accessToken = fanpageDetail.access_token;
    const dataPost = {
      website,
      phone,
      email,
      contact_address
    }
    const response = await axios.post(`https://graph.facebook.com/v21.0/me?access_token=${accessToken}`, dataPost)
    .then(response => response.data)
    .catch(() => {});
    if (response.success) {
      setNotification('Update successfully');
    }
    else {
      setNotification('Update failed');
    }
    setTimeout(() => {
      setNotification('');
    }, 5000);
  }
  return (
    <div className='bg-white w-[80%] h-[80%] m-auto p-5 rounded-lg'>
      <h1 className='text-2xl font-bold text-center'>Edit Fanpage Information</h1>
      <form className='flex flex-col overflow-auto h-full p-4' onSubmit={(e) => handleSubmit(e)}>
        <label className='font-semibold'>Name</label>
        <input disabled type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.name} />
        <label className='font-semibold'>ID</label>
        <input disabled type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.id} />
        <label className='font-semibold'>Website</label>
        <input type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.website} />
        <label className='font-semibold'>Phone</label>
        <input type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.phone} />
        <label className='font-semibold'>Email</label>
        <input type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.email} />
        <label className='font-semibold'>Contact Address</label>
        <input type='text' className='border border-gray-300 rounded-lg p-2 my-2' defaultValue={fanpageDetail.contact_address} />
        {notification && <p className={`${notification.includes('successfully') ? customStyle.success : customStyle.error}  font-semibold rounded p-2`}>
          {notification}
        </p>}
        <button className='bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg mt-2'>Save</button>
      </form>
    </div>
  )
}

const customStyle = {
  success: 'bg-green-400 text-white',
  error: 'bg-red-400 text-white',
}


export default EditFanpage;