import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Modal from './components/Modal';
import LoadingScreen from './components/LoadingScreen';
import DataInbox from './components/DataInbox';
import EditFanpage from './components/EditFanpage';
import './App.css'
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [listFanpages, setListFanpages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataInbox, setDataInbox] = useState([]);
  const [access_token, setAccessToken] = useState('');
  const [modalDataInbox, setModalDataInbox] = useState(false);
  const [modalEditFanpage, setModalEditFanpage] = useState(false);
  const [currentFanpageDetail, setCurrentFanpageDetail] = useState({});
  const [test2FA, setTest2FA] = useState('');

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
    setModalDataInbox(true);
    setAccessToken(fanpage.access_token);
    const response = await fetch(`https://graph.facebook.com/v21.0/${fanpage.id}/conversations?access_token=${fanpage.access_token}&fields=participants,link,message_count,unread_count,can_reply&limit=50`);
    const data = await response.json();
    const dataInbox = [];
    if (data.data.length > 0) {
      const lablesArr = await Promise.all(
        data.data.map(conversation => {
          return axios.get(`https://graph.facebook.com/v21.0/${conversation.participants.data[0].id}/custom_labels?fields=page_label_name&access_token=${fanpage.access_token}`)
          .then(response => response.data.data)
          .catch(() => []);
        })
      )
      const lastMessageArr = await Promise.all(
        data.data.map(conversation => {
          return axios.get(`https://graph.facebook.com/v21.0/${conversation.id}/messages?access_token=${fanpage.access_token}&fields=message,from,created_time&limit=1`)
          .then(response => response.data.data)
          .catch(() => []);
        })
      )
      let i = 0;
      for (const conversation of data.data) {
        const conversationId = conversation.id;
        const name = conversation.participants.data.filter(participant => participant.id !== fanpage.id)[0].name;
        const psid = conversation.participants.data.filter(participant => participant.id !== fanpage.id)[0].id;
        const link = 'https://www.facebook.com/' + conversation.link;
        const message_count = conversation.message_count;
        const unread_count = conversation.unread_count;
        const can_reply = conversation.can_reply;
        const labels = lablesArr[i];
        const last_message = {
          message: lastMessageArr[i].length > 0 ? lastMessageArr[i][0].message : '',
          from: lastMessageArr[i].length > 0 ? lastMessageArr[i][0].from.name : '',
          created_time: lastMessageArr[i].length > 0 ? lastMessageArr[i][0].created_time : ''
        }
        i++;
        dataInbox.push({conversationId, psid, name, link, message_count, unread_count, can_reply, labels, last_message});
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
    if (modalDataInbox) setModalDataInbox(false);
    if (modalEditFanpage) setModalEditFanpage(false);
  }

  const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const getPageLongLiveAccessToken = async (pageId, userAccessToken) => {
    const response = await axios.get(`https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&fb_exchange_token=${userAccessToken}`)
    .catch(error => console.error(error));
    const userLongLiveAccessToken = response.data.access_token;
    // Get long live access token for page
    const responsePage = await axios.get(`https://graph.facebook.com/v21.0/me/accounts?access_token=${userLongLiveAccessToken}`)
    .catch(error => console.error(error));
    const pages = responsePage.data.data;
    const page = pages.find(page => page.id === pageId);
    const pageLongLiveAccessToken = page.access_token;
    return pageLongLiveAccessToken;
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

  const handleEditFanpage = async (accessToken) => {
    setIsLoading(true);
    setModalEditFanpage(true);
    const fanpageDetail = await axios.get(`https://graph.facebook.com/v21.0/me?fields=name,id,website,phone,emails,contact_address,access_token&access_token=${accessToken}`)
    .then(response => response.data)
    .catch(() => {});
    if (fanpageDetail) {
      setCurrentFanpageDetail(fanpageDetail);
    }
    setIsLoading(false);
    setShowModal(true);
  }

  const handleSendMessage = async (psid, accessToken) => {
    const message = document.getElementsByClassName(`${psid}-inputMess`)[0].value;
    if (!message) {
      alert('Please enter message to send');
      return;
    }
    const response = await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`, {
      "messaging_type": "RESPONSE",
      "recipient": {
        "id": psid
      },
      "message": {
        "text": message
      }
    })
    .then(response => response.data)
    .catch(() => {});
    if (response?.message_id) {
      const dataNew = dataInbox.map(inbox => {
        if (inbox.psid === psid) {
          inbox.message_count++;
          inbox.last_message.message = message;
          inbox.last_message.created_time = new Date().toISOString();
          inbox.last_message.from = 'You';
        }
        return inbox;
      })
      setDataInbox(dataNew);
    }
    else {
      alert('Send message failed');
    }
  }

  const handleSubcribeToAutoReply = async (pageId, accessToken) => {
    setIsLoading(true);
    const response = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?subscribed_fields=messages&access_token=${accessToken}`)
      .then(response => response.data)
      .catch(() => null);
    if (response?.success) {
      const pageAccessTokenLongLive = await getPageLongLiveAccessToken(pageId, user.accessToken);
      const saveData = await axios.post('https://webhook-fb-bombot-dev.vercel.app/facebook/addPageData', {
        pageId: pageId,
        pageAccessToken: pageAccessTokenLongLive
      }).then(res => res.data).catch(error => console.log(error));
      if (saveData.success) {
        alert('Subcribed to Auto Reply successfully');
      }
    }
    else {
      alert('Subcribed to Auto Reply failed');
    }
    setIsLoading(false);
  }

  const handleGet2FA = async () => {
    setIsLoading(true);
    const response = await axios.get('https://webhook-fb-bombot-dev.vercel.app/facebook/get2faTestAccount')
      .then(response => response.data)
      .catch(() => null);
    if (response?.code) {
      setTest2FA(response.code);
    }
    else {
      alert('Get 2FA code failed');
    }
    setIsLoading(false);
  }

  return (
    <div className='w-full'>
      <div className='container-2'>
        {!user && <div className='absolute left-0'>
          {test2FA ? <p>2FA code: {test2FA}</p> : <button onClick={handleGet2FA} className={`${customStyle.styleBtnDefault}`}>Get 2FA code for testing account</button>}
        </div>}
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
                      <button
                        className={`${customStyle.styleBtnDefault} px-2 py-1 font-medium bg-yellow-100 ml-5`}
                        onClick={() => handleEditFanpage(fanpage.access_token)}
                      >
                        See and Edit Fanpage{`'`}s information
                      </button>
                      <button
                        className={`${customStyle.styleBtnDefault} px-2 py-1 font-medium bg-yellow-100 ml-5`}
                        onClick={() => handleSubcribeToAutoReply(fanpage.id, fanpage.access_token)}
                      >
                        Subcribed to Auto Reply
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
          {modalDataInbox &&
            <DataInbox
              dataInbox={dataInbox}
              access_token={access_token}
              handleAddNewLabel={handleAddNewLabel}
              getRandomColor={getRandomColor}
              handleDeleteLabel={handleDeleteLabel}
              handleSendMessage={handleSendMessage}
            />
          }
          {modalEditFanpage &&
            <EditFanpage  fanpageDetail={currentFanpageDetail}/>
          }
        </Modal>}
      {isLoading && <LoadingScreen />}
    </div>
  )
}

const customStyle = {
  styleBtnDefault: 'bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow'
}

export default App