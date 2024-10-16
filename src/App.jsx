import { useState } from 'react';
import LoginForm from './components/LoginForm';
import './App.css'

const App = () => {
  const [user, setUser] = useState(null);
  const [listFanpages, setListFanpages] = useState([]);

  const handleFacebookCallback = (response) => {
    if (response?.status === "unknown") {
        console.error('Sorry!', 'Something went wrong with facebook Login.');
     return;
    }
    setUser(response);
  }

  const fetchFacebookPage = async (accessToken) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
    const data = await response.json();
    if (data) {
      setListFanpages(data);
      console.log(data);  
    }
  }

  // useEffect(() => {
  //   if (user) {
  //     fetch('https://thanhlike.com/modun/tool/get_facebook.php?type=get2fa&code=setIsLogin', {mode: 'no-cors'})
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  //     .catch(error => console.error(error))
  //   }
  // }, [user])
  
  return (
    <div className=''>
      <div className='container-2'>
        <h1>Welcome to Bombot application</h1>
        <img src='../logo.png' width={100} height={100}/>
        <p>Login with Facebook to see your fanpages</p>
      </div>
      <div className='container'>

        {!user && <LoginForm handleFacebookCallback={handleFacebookCallback}/>}
        {user && 
        <div className='data-container'>
          <h2>Welcome {user.name}</h2>
          <img src={user.picture.data.url} alt={user.name} />
          <br/>
          <button onClick={() => fetchFacebookPage(user.accessToken)}>Get Fanpages</button>
          {listFanpages.data?.length > 0 &&
            <div>
              <h3>Your Fanpages</h3>
              <ul>
                {listFanpages.data.map((fanpage, index) => (
                  <li key={index}>{fanpage.name}</li>
                ))}
              </ul>
            </div>
          }
        </div>  
        }
      </div>
    </div>
    
  )
}

export default App