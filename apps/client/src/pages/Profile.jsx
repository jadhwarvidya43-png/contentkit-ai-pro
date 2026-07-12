import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Optionally, we could fetch the latest user data from the server on mount
  // to ensure we have the most up-to-date information.
  // However, since we update the context on login and profile update, it should be fine.
  // We'll skip this for simplicity to avoid an extra request.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate
    if (!form.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    // If attempting to change password, validate
    if (form.password || form.newPassword || form.confirmPassword) {
      if (!form.password) {
        setError('Please enter your current password');
        setLoading(false);
        return;
      }
      if (!form.newPassword) {
        setError('Please enter a new password');
        setLoading(false);
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          ...(form.password ? { password: form.password } : {}),
          ...(form.newPassword ? { newPassword: form.newPassword } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update the context with the new token and user data
      // The backend returns the updated user object (without password) and a new token
      login(data.token, {
        _id: data._id,
        email: data.email,
        isVerified: data.isVerified,
        role: data.role,
        name: data.name,
      });

      setSuccess('Profile updated successfully!');
      // Reset password fields
      setForm(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your profile information
            </p>
          </div>

          <div className="px-4 py-6 sm:px-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password (leave blank to keep current)
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {(
                form.password ||
                form.newPassword ||
                form.confirmPassword
              ) && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Leave new password fields empty if you don't want to change your password.
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded"
                >
                  Logout
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;