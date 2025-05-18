import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MomentsTab from '../components/chat/MomentsTab';
import MembersTab from '../components/chat/MembersTab';
import AboutTab from '../components/chat/AboutTab';
import GroupHeader from '../components/chat/GroupHeader'; // Import GroupHeader component
import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import { useEventMembersQuery } from '../hooks/queries/useEventMembersQuery';

const EventGroupPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('groupinfo');
  const { data: events = [] } = useMyEvents();
  const { data: members = [] } = useEventMembersQuery(eventId);
  const event = events.find(e => String(e._id || e.id) === String(eventId));

  return (
    <div className="flex flex-col h-screen bg-white max-w-[600px] mx-auto relative">
      {/* Header reused from GroupHeader for consistency */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-3 flex items-center">
        <GroupHeader event={event} onClick={() => {}} />
      </div>
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 bg-white sticky top-16 z-30">
        <button
          className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'groupinfo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('groupinfo')}
        >
          Group Info
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'moments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('moments')}
        >
          Moments
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
      </div>
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden pt-2">
        {activeTab === 'groupinfo' && (
          <div className="flex-1 overflow-y-auto">
            <AboutTab event={event} />
          </div>
        )}
        {activeTab === 'moments' && (
          <div className="flex-1 overflow-y-auto">
            <MomentsTab eventId={eventId} />
          </div>
        )}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto">
            <MembersTab members={members} event={event} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventGroupPage;
