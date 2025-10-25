import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.ts';
import { useAuth } from '../hooks/useAuth.tsx';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = isLogin 
        ? await authAPI.login({ email, password })
        : await authAPI.register({ name, email, password });
      
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError?.response?.data?.message || 
                     apiError?.message || 
                     'An error occurred';
      setError(message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              required
            />
          </div>
        )}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#FF6D00', color: 'white', border: 'none' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#FF6D00', cursor: 'pointer' }}>
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default Login;