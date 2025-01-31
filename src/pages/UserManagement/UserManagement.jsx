import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'user'
  });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
    if (error) console.error('Error fetching users:', error);
  };

  const handleDeleteUser = async (userId) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (!error) {
      fetchUsers();
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('users')
      .insert([{
        ...newUser,
        password_hash: 'temporary_password', // Replace with secure password generation
        is_active: true
      }]);
    
    if (!error) {
      fetchUsers();
      setIsModalOpen(false);
      setNewUser({ username: '', email: '', role: 'user' });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('users')
      .update({
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role
      })
      .eq('id', selectedUser.id);
    
    if (!error) {
      fetchUsers();
      setSelectedUser(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {/* Search and Add User */}
      <div className="flex justify-between mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
          <Search className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white p-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" /> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-500 mr-3"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-3 text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl mb-4">Edit User</h2>
            <form onSubmit={handleEditUser}>
              <input
                type="text"
                placeholder="Username"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
                required
              />
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                className="w-full p-2 mb-3 border rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="mr-3 text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
