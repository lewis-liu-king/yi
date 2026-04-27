import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getConversations, createConversation, deleteConversation } from '../store/slices/conversationSlice';
import { logout } from '../store/slices/userSlice';
import { RootState } from '../store/store';

const ConversationListPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConversation, setNewConversation] = useState({ title: '', description: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, loading } = useSelector((state: RootState) => state.conversation);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getConversations() as any);
  }, [dispatch]);

  const handleCreateConversation = () => {
    if (newConversation.title.trim()) {
      dispatch(createConversation(newConversation) as any).then(() => {
        setShowCreateModal(false);
        setNewConversation({ title: '', description: '' });
      });
    }
  };

  const handleDeleteConversation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      dispatch(deleteConversation(id) as any);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Tree Chat</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm">Welcome, {user.username}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Conversations</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            New Conversation
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="loading"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Create your first conversation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.map(conversation => (
              <div key={conversation._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg truncate">{conversation.title}</h3>
                  <button
                    onClick={() => handleDeleteConversation(conversation._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                {conversation.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                    {conversation.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>{conversation.nodeCount} messages</span>
                  <span>
                    {new Date(conversation.lastAccessedAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/conversations/${conversation._id}`)}
                  className="mt-4 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-sm"
                >
                  Open Conversation
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create conversation modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Conversation</h3>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                id="title"
                value={newConversation.title}
                onChange={(e) => setNewConversation(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                id="description"
                value={newConversation.description}
                onChange={(e) => setNewConversation(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationListPage;