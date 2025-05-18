import React from 'react';
const AnnouncementTab = ({ announcements = [] }) => (
  <div className="p-4">
    {announcements.length === 0 ? (
      <div className="text-center text-gray-400">No announcements yet.</div>
    ) : (
      <ul className="space-y-2">
        {announcements.map((a, idx) => (
          <li key={a.id || idx} className="p-3 bg-yellow-50 rounded component-card border-l-4 border-theme-accent">
            <div className="font-semibold text-theme-accent mb-1">{a.title || 'Announcement'}</div>
            <div className="text-gray-700 text-sm">{a.text || a.content}</div>
            {a.date && <div className="text-xs text-gray-400 mt-1">{a.date}</div>}
          </li>
        ))}
      </ul>
    )}
  </div>
);
export default AnnouncementTab;
