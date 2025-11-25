import React from 'react'
import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'


const LoginPage = () => {

    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setLoading(true);
        try{
            if(isRegister){
                await axiosClient.post('/auth/register',{username, password});
                alert('Registration successful. Please login.');
                setIsRegister(false);
                setPassword('');
            }
            else{
                const res = await axiosClient.post('/auth/login',{username, password});

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                alert('Login successful');
                navigate('/board');
            }
        }
        catch(error){
            alert(error.response.data.message);
        }
        finally{
            setLoading(false);
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isRegister ? 'Register' : 'Login'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {isRegister && <p className="text-xs text-gray-500 mt-1">*Password must be at least 6 characters long.</p>}
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className={`w-full text-white p-2 rounded transition-colors font-semibold ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    {isRegister ? 'You had an account? ' : "Don't have an account? "}
                    <button
                        type='button'
                        className="text-blue-600 hover:underline font-bold"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setLoading(false);
                            setPassword('');
                        }}
                    >
                        {isRegister ? 'Login now' : 'Register here'}
                    </button>
                </div>
            </div>
        </div>
  );
}

export default LoginPage
