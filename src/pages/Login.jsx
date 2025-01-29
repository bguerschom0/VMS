import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await signIn(formData.username, formData.password);
      if (error) {
        setError('Invalid username or password');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError('An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visitor Management System
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to manage visitors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter your username"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth>
            Sign In
          </Button>

          <div className="text-sm text-gray-500 text-center mt-4">
            Use username: admin, password: 456
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
