import React from 'react';

/**
 * MembersTab displays the list of event attendees
 * @param {Array} members - Array of attendees from the event model
 */
const MembersTab = ({ members = [] }) => {
  console.log('Rendering MembersTab with members:', members);
  return (
  <div className="p-4">
    {members.length === 0 ? (
      <div className="text-center text-gray-400">No attendees listed yet.</div>
    ) : (
      <ul className="space-y-2">
        {members.map((attendee, idx) => {
          // Handle both formats: {userId, joinedAt} or {id, name, avatar}
          const userId = attendee.userId || attendee.id;
          const joinDate = attendee.joinedAt ? new Date(attendee.joinedAt).toLocaleDateString() : '';
          
          return (
            <li key={userId || idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded component-card">
              <img
                src={attendee.avatar || '/user-avatar.png'}
                alt={attendee.name || `User ${userId?.substring(0, 8)}`}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-white"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">
                  {attendee.name || `User ${userId?.substring(0, 8)}`}
                </span>
                {joinDate && (
                  <span className="text-xs text-gray-500">Joined {joinDate}</span>
                )}
              </div>
              {attendee.role && (
                <span className="ml-auto text-xs text-theme-accent">{attendee.role}</span>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </div>
);
};

export default MembersTab;
