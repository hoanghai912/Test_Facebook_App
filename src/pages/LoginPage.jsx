/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage = ({ onLogin }) => {
    const [test2FA, setTest2FA] = useState('');

    const handleGet2FA = () => {
        // Assuming otplib is available on window as per original code
        if (window.otplib) {
            setTest2FA(window.otplib.authenticator.generate('FLU7JIXJ7RAZ4KHOIDQ7Q357EP6IQG55'));
        } else {
            console.error('otplib not found');
        }
    };

    const dummyHandle = (response) => {
        onLogin(response);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="absolute top-4 left-4">
                {test2FA ? (
                    <p className="bg-gray-100 p-2 rounded shadow">2FA code: <span className="font-bold">{test2FA}</span></p>
                ) : (
                    <button
                        onClick={handleGet2FA}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded shadow text-sm"
                    >
                        Get 2FA code for testing
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome</h1>
                <p className="text-gray-500 mb-6">Bombot Application</p>
                <img src="/logo.png" alt="Bombot" className="w-24 h-24 mx-auto mb-6 drop-shadow-sm" />

                <p className="mb-6 text-gray-600">Login with Facebook to manage your fanpages</p>

                <LoginForm handleFacebookCallback={dummyHandle} />
            </div>
        </div>
    );
};

export default LoginPage;
