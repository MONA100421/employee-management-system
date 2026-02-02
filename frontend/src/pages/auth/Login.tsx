import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;

  const { login } = auth;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const res = await login(username, password);

    if (res.ok && res.user) {
      if (res.user.role === 'hr') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } else {
      setError(res.message ?? 'Login failed');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleSubmit}>Login</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
