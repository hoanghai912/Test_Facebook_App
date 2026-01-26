/* eslint-disable react/prop-types */
import { useState } from 'react';
import { facebookService } from '../api/facebookService';

const EditFanpage = ({ fanpageDetail }) => {
  const [notification, setNotification] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const website = e.target[2].value;
    const phone = e.target[3].value;
    const email = e.target[4].value;
    const contact_address = e.target[5].value;
    const accessToken = fanpageDetail.access_token;

    const dataPost = { website, phone, email, contact_address };

    try {
      const response = await facebookService.updatePageDetails(accessToken, dataPost);
      if (response.success) {
        setNotification('Update successfully');
      } else {
        setNotification('Update failed');
      }
    } catch (error) {
      setNotification('Update failed');
    }

    setTimeout(() => {
      setNotification('');
    }, 5000);
  }
  return (
    <div className='bg-white w-full h-full p-6 overflow-auto'>
      <h1 className='text-2xl font-bold text-center mb-6 text-gray-800'>Edit Fanpage Information</h1>
      <form className='flex flex-col gap-4' onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label className='font-semibold text-gray-700 block mb-1'>Name</label>
          <input disabled type='text' className='w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-500' defaultValue={fanpageDetail.name} />
        </div>

        <div>
          <label className='font-semibold text-gray-700 block mb-1'>ID</label>
          <input disabled type='text' className='w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-500' defaultValue={fanpageDetail.id} />
        </div>

        <div>
          <label className='font-semibold text-gray-700 block mb-1'>Website</label>
          <input type='text' className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition' defaultValue={fanpageDetail.website} />
        </div>

        <div>
          <label className='font-semibold text-gray-700 block mb-1'>Phone</label>
          <input type='text' className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition' defaultValue={fanpageDetail.phone} />
        </div>

        <div>
          <label className='font-semibold text-gray-700 block mb-1'>Email</label>
          <input type='text' className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition' defaultValue={fanpageDetail.email} />
        </div>

        <div>
          <label className='font-semibold text-gray-700 block mb-1'>Contact Address</label>
          <input type='text' className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition' defaultValue={fanpageDetail.contact_address} />
        </div>

        {notification && <p className={`text-center font-semibold rounded p-3 text-sm ${notification.includes('successfully') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {notification}
        </p>}

        <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-4 transition shadow-md'>
          Save Changes
        </button>
      </form>
    </div>
  )
}

export default EditFanpage;