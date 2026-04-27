import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversationById, setCurrentBranch } from '../store/slices/conversationSlice';
import { createMessage, getMessageById, getChildMessages, updateMessage, deleteMessage } from '../store/slices/messageSlice';
import { RootState } from '../store/store';
import aiService from '../services/ai';

const ConversationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messageInput, setMessageInput] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchParentId, setBranchParentId] = useState('');
  const [branchMessage, setBranchMessage] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const { currentConversation, currentBranch, loading } = useSelector((state: RootState) => state.conversation);
  const { messages } = useSelector((state: RootState) => state.message);

  useEffect(() => {
    if (id) {
      dispatch(getConversationById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Load messages for current branch
    if (currentBranch.length > 0) {
      currentBranch.forEach(messageId => {
        if (!messages[messageId]) {
          dispatch(getMessageById(messageId) as any);
        }
      });
    }
  }, [dispatch, currentBranch, messages]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentBranch]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && currentConversation) {
      // Create user message
      const userMessage = await dispatch(createMessage({
        content: messageInput,
        parentId: currentBranch[currentBranch.length - 1],
        conversationId: currentConversation._id,
        sender: 'user'
      }) as any).unwrap();

      // Update current branch
      const newBranch = [...currentBranch, userMessage._id];
      dispatch(setCurrentBranch(newBranch));

      // Get context for AI
      const contextMessages = newBranch.map(msgId => messages[msgId]).filter(Boolean);

      // Get AI response
      try {
        const aiResponse = await aiService.chat({
          message: messageInput,
          context: contextMessages
        });

        // Create AI message
        await dispatch(createMessage({
          content: aiResponse.response,
          parentId: userMessage._id,
          conversationId: currentConversation._id,
          sender: 'ai'
        }) as any).unwrap();
      } catch (error) {
        console.error('Error getting AI response:', error);
      }

      setMessageInput('');
    }
  };

  const handleCreateBranch = async () => {
    if (branchMessage.trim() && currentConversation && branchParentId) {
      // Create user message as new branch
      const userMessage = await dispatch(createMessage({
        content: branchMessage,
        parentId: branchParentId,
        conversationId: currentConversation._id,
        sender: 'user'
      }) as any).unwrap();

      // Get context for AI
      const context = [];
      let currentId = branchParentId;
      while (currentId) {
        const message = messages[currentId];
        if (message) {
          context.unshift(message);
          currentId = message.parentId;
        } else {
          break;
        }
      }

      // Get AI response
      try {
        const aiResponse = await aiService.chat({
          message: branchMessage,
          context
        });

        // Create AI message
        await dispatch(createMessage({
          content: aiResponse.response,
          parentId: userMessage._id,
          conversationId: currentConversation._id,
          sender: 'ai'
        }) as any).unwrap();
      } catch (error) {
        console.error('Error getting AI response:', error);
      }

      setShowBranchModal(false);
      setBranchParentId('');
      setBranchMessage('');
    }
  };

  const handleNodeClick = (messageId: string) => {
    // Find path to this node
    const path: string[] = [];
    let currentId = messageId;
    
    while (currentId) {
      path.unshift(currentId);
      const message = messages[currentId];
      if (message) {
        currentId = message.parentId || '';
      } else {
        break;
      }
    }

    dispatch(setCurrentBranch(path));
  };

  const toggleNodeExpansion = (messageId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(messageId)) {
      newExpandedNodes.delete(messageId);
    } else {
      newExpandedNodes.add(messageId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const loadChildMessages = (messageId: string) => {
    const message = messages[messageId];
    if (message && message.childrenIds.length > 0) {
      message.childrenIds.forEach(childId => {
        if (!messages[childId]) {
          dispatch(getChildMessages(messageId) as any);
        }
      });
    }
  };

  const renderTree = (messageId: string, level: number = 0) => {
    const message = messages[messageId];
    if (!message) return null;

    const isExpanded = expandedNodes.has(messageId);
    const isActive = currentBranch.includes(messageId);

    return (
      <div key={messageId}>
        <div
          className={`tree-node p-2 rounded-md flex items-center ${isActive ? 'active' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {message.childrenIds.length > 0 && (
            <button
              onClick={() => {
                toggleNodeExpansion(messageId);
                if (!isExpanded) {
                  loadChildMessages(messageId);
                }
              }}
              className="mr-2 text-gray-500"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <div
            onClick={() => handleNodeClick(messageId)}
            className="flex-grow cursor-pointer"
          >
            <div className="text-sm font-medium">
              {message.sender === 'user' ? 'You' : 'AI'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {message.content.substring(0, 50)}{message.content.length > 50 ? '...' : ''}
            </div>
          </div>
          <button
            onClick={() => {
              setBranchParentId(messageId);
              setShowBranchModal(true);
            }}
            className="ml-2 text-blue-500 hover:text-blue-700"
            title="Create branch"
          >
            +
          </button>
        </div>
        {isExpanded && message.childrenIds.length > 0 && (
          <div>
            {message.childrenIds.map(childId => renderTree(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading || !currentConversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/conversations')}
              className="text-blue-500 hover:underline mb-1 inline-block"
            >
              ← Back to conversations
            </button>
            <h1 className="text-xl font-bold">{currentConversation.title}</h1>
            {currentConversation.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentConversation.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex">
        {/* Tree navigation */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Conversation Tree</h2>
          {renderTree(currentConversation.rootNodeId)}
        </div>

        {/* Message content */}
        <div className="flex-grow flex flex-col p-4 overflow-hidden">
          <div className="flex-grow overflow-y-auto mb-4">
            {currentBranch.map(messageId => {
              const message = messages[messageId];
              if (!message) return null;

              return (
                <div
                  key={messageId}
                  className={`message p-4 mb-4 rounded-lg ${message.sender === 'user' ? 'bg-blue-50 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                >
                  <div className="flex items-center mb-2">
                    <span className={`font-medium ${message.sender === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                      {message.sender === 'user' ? 'You' : 'AI'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        setBranchParentId(messageId);
                        setShowBranchModal(true);
                      }}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Create branch
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Create branch modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Branch</h3>
            <div className="mb-4">
              <label htmlFor="branch-message" className="block text-sm font-medium mb-2">Message</label>
              <textarea
                id="branch-message"
                value={branchMessage}
                onChange={(e) => setBranchMessage(e.target.value)}
                rows={4}
                placeholder="Type your message..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowBranchModal(false);
                  setBranchParentId('');
                  setBranchMessage('');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBranch}
                disabled={!branchMessage.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDetailPage;