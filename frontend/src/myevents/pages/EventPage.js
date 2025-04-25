import React from 'react';
import { useParams } from 'react-router-dom';

import EventBio from '../components/event/EventBio';
import EventTabs from '../components/event/EventTabs';
import MembersTab from '../components/chat/MembersTab';
import { useNavigate } from 'react-router-dom';

import AboutTab from '../components/chat/AboutTab';
import AnnouncementTab from '../components/chat/AnnouncementTab';
import { useEventsQuery } from '../hooks/queries/useEventsQuery';
import { useEventBioQuery } from '../hooks/queries/useEventBioQuery';
import { useEventTabsQuery } from '../hooks/queries/useEventTabsQuery';
import { useEventMembersQuery } from '../hooks/queries/useEventMembersQuery';
import { useEventAnnouncementsQuery } from '../hooks/queries/useEventAnnouncementsQuery';
import useEventsStore from '../hooks/stores/eventsStore';

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  // Query for all events and find the current event
  const { data: events = [], isLoading: isEventsLoading, isError: isEventsError } = useEventsQuery();
  console.log('[EventPage] eventId:', eventId);
  console.log('[EventPage] events:', events);
  console.log('[EventPage] events:', events.map(e => ({id: e.id, _id: e._id, eventName: e.eventName, title: e.title})));
  // Find event by either _id or id
  const event = events.find(e => {
    const eventIdField = e._id || e.id;
    console.log('[EventPage] Comparing:', eventIdField, 'with:', eventId);
    return String(eventIdField) === String(eventId);
  });
  console.log('[EventPage] Resolved event:', event);
  // Zustand store for tab state
  const activeTab = useEventsStore(state => state.activeTab);
  const setActiveTab = useEventsStore(state => state.setActiveTab);
  // Query for bio, tabs, members, and announcements
  const { data: bio = '', isLoading: isBioLoading } = useEventBioQuery(eventId);
  const { data: tabs = [], isLoading: isTabsLoading } = useEventTabsQuery();
  const { data: members = [], isLoading: isMembersLoading } = useEventMembersQuery(eventId);
  const { data: announcements = [], isLoading: isAnnouncementsLoading } = useEventAnnouncementsQuery(eventId);

  if (isEventsLoading) return <div className="p-4 text-center text-gray-500">Loading event...</div>;
  if (isEventsError || !event) return <div className="p-4 text-center text-red-500">Event not found.</div>;

  // Custom handler for tabs: navigate to chat page if chat tab is clicked
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* WhatsApp-style header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
        <button
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => navigate(-1)}
          aria-label="Back"
          type="button"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img
          src={event.thumbnail || event.imageUrl || event.event_image || "/default-group.png"}
          alt={event.title || event.eventName || "Event"}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
        />
        <span className="font-semibold text-base text-primary truncate">{event.title || event.eventName}</span>
      </div>
      {isBioLoading ? (
        <div className="p-4 text-gray-500">Loading bio...</div>
      ) : (
        <EventBio bio={bio} />
      )}
      {isTabsLoading ? (
        <div className="p-4 text-gray-500">Loading tabs...</div>
      ) : (
        <EventTabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          tabs={tabs.filter(tab => tab.key !== 'chat')}
        />
      )}
      <div className="flex-1">
        {activeTab === 'members' && (
          isMembersLoading ? (
            <div className="p-4 text-gray-500">Loading members...</div>
          ) : (
            <MembersTab members={members} />
          )
        )}
        {activeTab === 'announcements' && (
          isAnnouncementsLoading ? (
            <div className="p-4 text-gray-500">Loading announcements...</div>
          ) : (
            <AnnouncementTab announcements={announcements} />
          )
        )}
        {activeTab === 'about' && <AboutTab event={event} />}
      </div>
    </div>
  );
};

export default EventPage;
