import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { useChatList } from '../hooks/queries/useChatQueries';
import ChatListItem from '../components/ChatListItem';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const ChatsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: chats = [], isLoading } = useChatList(user?._id);

  const handleChatClick = (chatId) => {
    navigate(`/messages/${chatId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {/* Search bar */}
      <div className="relative px-4 py-3 bg-white shadow-sm">
        <input
          type="text"
          placeholder="Search..."
          disabled
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <FaSearch className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-white divide-y">
        {isLoading ? (
          <p className="p-4 text-center text-gray-500">Loading...</p>
        ) : chats.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No chats yet.</p>
        ) : (
          chats.map((c) => (
            <ChatListItem
              key={c.chatId}
              chat={c}
              onClick={() => handleChatClick(c.chatId)}
              currentUserId={user?._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
