import { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (response) => {
    if (response?.status === "unknown") {
      alert('Sorry!', 'Something went wrong with facebook Login.');
      return;
    }
    localStorage.setItem('user', JSON.stringify(response))
    setUser(response);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Layout>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </Layout>
  );
};

export default App;