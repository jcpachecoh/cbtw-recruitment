'use client';
import React, { useState, useEffect } from 'react';

// Types

type UserType = 'admin' | 'recruiter' | 'technical_lead';
type UserStatus = 'active' | 'inactive' | 'pending';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userType: UserType;
  userStatus: UserStatus;
  department?: string;
  lastLoginTime?: string;
  createdAt: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: 'recruiter' as UserType,
    department: '',
    phoneNumber: '',
  });

  const departments = ['HR', 'Engineering', 'Marketing', 'Sales'];
  const roles = ['Admin', 'Recruiter', 'Technical Lead'];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Department validation
    if (!formData.department) {
      errors.department = 'Department is required';
    }

    // User Type validation
    if (!formData.userType) {
      errors.userType = 'User type is required';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const dataPayload = { ...formData, userName: formData.email.split('@')[0] }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataPayload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setSuccess('User created successfully');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userType: 'recruiter',
        department: '',
        phoneNumber: '',
      });
      fetchUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);

      setError(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/users?id=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Success/Error Messages */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Create User Modal Toggle */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-yellow-200 text-black px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        + Create User
      </button>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowCreateModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Create User</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {['firstName', 'lastName', 'email', 'password', 'phoneNumber'].map((field) => (
                  <div key={field} className="space-y-1">
                    <input
                      type={field === 'password' ? 'password' : 'text'}
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                      className={`w-full border p-2 rounded ${formErrors[field] ? 'border-red-500' : ''}`}
                    />
                    {formErrors[field] && (
                      <p className="text-red-500 text-xs">{formErrors[field]}</p>
                    )}
                  </div>
                ))}
                <div className="space-y-1">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full border p-2 rounded ${formErrors.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <p className="text-red-500 text-xs">{formErrors.department}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className={`w-full border p-2 rounded ${formErrors.userType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select User Type</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {formErrors.userType && (
                    <p className="text-red-500 text-xs">{formErrors.userType}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-yellow-200 text-black py-2 rounded hover:bg-yellow-300 transition-colors"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-medium">Name</th>

              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Type</th>
              <th className="p-3 text-left font-medium">User Status</th>
              <th className="p-3 text-left font-medium">Department</th>
              <th className="p-3 text-left font-medium">Phone Number</th>
              <th className="p-3 text-left font-medium">Last Login</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.firstName} {user.lastName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.userType}</td>


                <td className="p-3 capitalize">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${user.userStatus === 'active' ? 'text-green-900' :
                    user.userStatus === 'inactive' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${user.userStatus === 'active' ? 'bg-green-200' :
                      user.userStatus === 'inactive' ? 'bg-red-200' : 'bg-yellow-200'
                      }`}></span>
                    <span className="relative">{user.userStatus}</span>
                  </span>
                </td>
                <td className="p-3">{user.department}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3">{user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleDateString() : 'Never'}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete <strong>{userToDelete.userName}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;