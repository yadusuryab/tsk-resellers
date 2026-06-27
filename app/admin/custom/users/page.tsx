'use client';

import { useState, useEffect } from 'react';
import {
  IconSearch,
  IconUser,
  IconMail,
  IconPhone,
  IconCheck,
  IconBan,
  IconKey,
  IconMailForward,
  IconClock,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ Call your API route instead of direct Supabase
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      console.log('API Response:', data); // Should show all 3 users
      console.log('Users count:', data.users?.length);
      
      if (data.users) {
        let filteredUsers = data.users;
        
        // Apply filters
        if (filter === 'paid') {
          filteredUsers = data.users.filter((u: any) => u.is_paid === true);
        } else if (filter === 'trial') {
          filteredUsers = data.users.filter((u: any) => 
            !u.is_paid && new Date(u.trial_end) > new Date()
          );
        } else if (filter === 'expired') {
          filteredUsers = data.users.filter((u: any) => 
            !u.is_paid && new Date(u.trial_end) <= new Date()
          );
        } else if (filter === 'banned') {
          filteredUsers = data.users.filter((u: any) => u.is_banned === true);
        } else if (filter === 'admin') {
          filteredUsers = data.users.filter((u: any) => u.is_admin === true);
        }
        
        console.log('Filtered users count:', filteredUsers.length);
        setUsers(filteredUsers);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove any direct supabase calls from your component
  // Don't use supabase.from('users').select('*') anywhere

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchUsers} 
            className="mt-2 text-sm text-red-700 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage all users</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Users ({users.length})</option>
            <option value="paid">Paid Users</option>
            <option value="trial">Trial Active</option>
            <option value="expired">Trial Expired</option>
            <option value="banned">Banned</option>
            <option value="admin">Admins</option>
          </select>
          <div className="relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/custom/users/${user.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconUser size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <IconMail size={12} /> {user.email}
                            </span>
                            {user.phone && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <IconPhone size={12} /> {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.is_paid ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <IconCheck size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          <IconClock size={12} /> Trial
                        </span>
                      )}
                      {user.is_admin && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          <IconBan size={12} /> Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {!user.is_paid && (
                      <p className="text-sm text-gray-900">
                        {new Date(user.trial_end) > new Date() ? (
                          <span className="text-green-600">
                            {Math.ceil((new Date(user.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                          </span>
                        ) : (
                          <span className="text-red-600">Expired</span>
                        )}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          // Handle password reset
                          fetch('/api/admin/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'reset_password',
                              userId: user.id,
                              data: { email: user.email }
                            })
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Send password reset"
                      >
                        <IconKey size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          await fetch('/api/admin/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'toggle_admin',
                              userId: user.id,
                              data: { is_admin: !user.is_admin }
                            })
                          });
                          fetchUsers(); // Refresh
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title={user.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        <IconMailForward size={16} />
                      </button>
                      {user.is_banned ? (
                        <button
                          onClick={async () => {
                            await fetch('/api/admin/users', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                action: 'unban',
                                userId: user.id,
                                data: {}
                              })
                            });
                            fetchUsers(); // Refresh
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                          title="Unban user"
                        >
                          <IconCheck size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for banning?');
                            if (reason) {
                              fetch('/api/admin/users', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'ban',
                                  userId: user.id,
                                  data: { reason }
                                })
                              }).then(() => fetchUsers());
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Ban user"
                        >
                          <IconBan size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}