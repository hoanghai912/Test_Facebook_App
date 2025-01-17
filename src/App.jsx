import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Modal from './components/Modal';
import LoadingScreen from './components/LoadingScreen';
import './App.css'
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [listFanpages, setListFanpages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataInbox, setDataInbox] = useState([]);
  const [access_token, setAccessToken] = useState('');

  const handleFacebookCallback = (response) => {
    if (response?.status === "unknown") {
      console.error('Sorry!', 'Something went wrong with facebook Login.');
      return;
    }
    setUser(response);
  }

  const fetchFacebookPage = async (accessToken) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}&fields=name,id,access_token`);
    const data = await response.json();
    if (data) {
      setListFanpages(data);
      // console.log(data);
    }
  }

  const handleShowDataOfFanpage = async (fanpage) => {
    setIsLoading(true);
    // setDataFanpage(fanpage);
    setAccessToken(fanpage.access_token);
    const response = await fetch(`https://graph.facebook.com/v21.0/${fanpage.id}/conversations?access_token=${fanpage.access_token}&fields=participants,link,message_count,unread_count&limit=50`);
    const data = await response.json();
    const dataInbox = [];
    if (data.data.length > 0) {
      for (const conversation of data.data) {
        const name = conversation.participants.data.filter(participant => participant.id !== fanpage.id)[0].name;
        const psid = conversation.participants.data.filter(participant => participant.id !== fanpage.id)[0].id;
        const link = 'https://www.facebook.com/' + conversation.link;
        const message_count = conversation.message_count;
        const unread_count = conversation.unread_count;
        const labels = await axios.get(`https://graph.facebook.com/v21.0/${psid}/custom_labels?fields=page_label_name&access_token=${fanpage.access_token}`)
        .then(response => response.data.data)
        .catch(() => []);
        dataInbox.push({psid, name, link, message_count, unread_count, labels});
      }
      // console.log(dataInbox);
      setDataInbox(dataInbox);
    }
    else {
      setDataInbox([]);
    }

    setIsLoading(false);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const handleDeleteLabel = async (labelId, psid, accessToken) => {
    setIsLoading(true);
    await axios.delete(`https://graph.facebook.com/v21.0/${labelId}/label?user=${psid}&access_token=${accessToken}`)
    .then(response => {
      if (response.data.success) {
        const changedDataInbox = dataInbox.map(inbox => {
          if (inbox.psid === psid) {
            const newLabels = inbox.labels.filter(label => label.id !== labelId);
            return {...inbox, labels: newLabels};
          }
          return inbox;
        })
        setDataInbox(changedDataInbox);
      }
    })
    .catch(error => {
      console.error(error);
    })
    setIsLoading(false);
  }

  const handleAddNewLabel = async (psid, accessToken) => {
    setIsLoading(true);
    const nameLable = document.getElementsByClassName(`${psid}-input`)[0].value;
    const idLabel = await axios.post(`https://graph.facebook.com/v21.0/me/custom_labels?access_token=${accessToken}`, {
      "page_label_name": nameLable
    }).then(response => response.data.id).catch(() => '');
    if (idLabel) {
      await axios.post(`https://graph.facebook.com/v21.0/${idLabel}/label?access_token=${accessToken}`, {
        "user": psid
      })
      .then(response => {
        if (response.data.success) {
          const changedDataInbox = dataInbox.map(inbox => {
            if (inbox.psid === psid) {
              const newLabels = [...inbox.labels, {id: idLabel, page_label_name: nameLable}];
              return {...inbox, labels: newLabels};
            }
            return inbox;
          })
          setDataInbox(changedDataInbox);
        }
      })
      .catch(error => {
        console.error(error);
      })
    }
    document.getElementsByClassName(`${psid}-input`)[0].value = '';
    setIsLoading(false);
  }
  return (
    <div className='w-full'>
      <div className='container-2'>
        <h1 className='text-2xl font-bold'>Welcome to Bombot application</h1>
        <img src='../logo.png' width={100} height={100} className='m-5' />
        <p>Login with Facebook to see your fanpages</p>
      </div>
      <div className='flex justify-center items-center'>
        <div className='m-2'>
          {!user && <LoginForm handleFacebookCallback={handleFacebookCallback} />}
        </div>
        {user &&
          <div className='data-container'>
            <h2>Welcome <span className='font-bold text-green-500'>{user.name}</span></h2>
            <img src={user.picture.data.url} alt={user.name} className='m-5'/>
            <br />
            <button onClick={() => fetchFacebookPage(user.accessToken)}
              className={`${customStyle.styleBtnDefault}`}>
              Get Fanpages
            </button>
            {listFanpages.data?.length > 0 &&
              <div>
                <h3 className='text-xl text-blue-700'>Your Fanpages</h3>
                <ul className='list-disc list-inside overflow-auto'>
                  {listFanpages.data.map((fanpage, index) => (
                    <li key={index} className='py-2'>
                      {fanpage.name}
                      <button
                        className={`${customStyle.styleBtnDefault} px-2 py-1 font-medium bg-blue-100 ml-5`}
                        onClick={() => handleShowDataOfFanpage(fanpage)}
                      >
                        See data inbox to your page
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            }
          </div>
        }
      </div>
      {showModal && 
      <Modal handleCloseModal={handleCloseModal}>
        <ul className='overflow-auto h-[80%] list-disc list-inside m-5'>
          {dataInbox.map((inbox, index) => (
            <li key={index} className='py-2'>
              <a href={inbox.link} target='_blank' className='hover:text-blue-500'>{inbox.name} </a> 
              - 
              <span className='text-green-500 font-medium'> {inbox.message_count} messages </span> 
              - 
              <span className='text-red-500 font-medium'> {inbox.unread_count} unread </span>
              <p className='font-bold text-sm'>Labels of this conversation:</p>
              <input type='text' className={`${inbox.psid}-input border-2`} />
              <button className={`${customStyle.styleBtnDefault} px-3 py-2 text-xs mx-2 my-2 text-green-500`}
                onClick={() => handleAddNewLabel(inbox.psid, access_token)}
              >Add new</button>
              <p></p>
              {inbox.labels.map((label) => {
                return (
                  <div key={label.id} className='inline-block mr-2'>
                    <p className={`inline-block bg-[${getRandomColor()}] p-1 px-2 rounded text-sm`}>
                      {label.page_label_name}
                      <button className={`${customStyle.styleBtnDefault} px-1 py-0.5 ml-2 text-xs text-red-500`}
                        onClick={() => handleDeleteLabel(label.id, inbox.psid, access_token)}
                      >x</button>
                    </p>
                  </div>
                )
              })}
            </li>
          ))} 
        </ul>
      </Modal>}
      {isLoading && <LoadingScreen />}
    </div>
  )
}

const customStyle = {
  styleBtnDefault: 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
}

export default App