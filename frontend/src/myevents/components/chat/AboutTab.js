import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaTrash, FaTag, FaClock, FaCalendarAlt, FaUsers, FaRupeeSign, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';
import { useState as useLocalState } from 'react';

const TAG_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
];

/**
 * AboutTab displays general information about an event, inspired by EventDetailPage
 */
const AboutTab = ({ event }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  
  // Get current user from auth store
  const currentUser = useAuthStore(state => state.user);
  
  // Check if current user is the host of the event
  useEffect(() => {
    if (!currentUser || !event || !event.host) return;
    if (typeof event.host === 'object') {
      if (event.host.userId) {
        setIsHost(event.host.userId.toString() === currentUser._id.toString());
      } else if (event.host._id) {
        setIsHost(event.host._id.toString() === currentUser._id.toString());
      } else if (event.host.id) {
        setIsHost(event.host.id.toString() === currentUser._id.toString());
      }
    } else {
      setIsHost(event.host.toString() === currentUser._id.toString());
    }
  }, [currentUser, event]);

  const attendeeCount = Array.isArray(event.attendees) 
    ? event.attendees.length 
    : (typeof event.attendees === 'number' ? event.attendees : 0);

  // Google Maps URL
  const getGoogleMapsUrl = () => {
    if (event?.place?.coordinates?.latitude && event?.place?.coordinates?.longitude) {
      const { latitude, longitude } = event.place.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    if (event?.place?.name && event?.location?.city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.place.name}, ${event.location.city}, India`
      )}`;
    }
    if (event?.location?.city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.location.city}, India`
      )}`;
    }
    return null;
  };
  const mapsUrl = getGoogleMapsUrl();

  // Helper: format date/time
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return date;
    }
  };
  const formatTime = (time) => {
    if (!time) return null;
    if (time.length <= 5 && time.includes(':')) return time;
    try {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  // Host/Organizer info
  const host = event.host || event.organizer;
  const hostName = host?.name || host?.username || host?.email || 'Unknown';
  const hostAvatar = host?.image || host?.avatar || null;
  const hostRole = event.organizer ? 'Organizer' : 'Host';

  // Tags
  const tags = event.tags || event.tagList || [];

  // Event status
  const isClosed = event.status === 'closed' || event.isClosed;

  // Price
  const price = event.price || event.fee || 0;

  // RSVP deadline
  const rsvp = event.rsvpDeadline || event.rsvp || null;

  // Event type
  const type = event.type || event.eventType || 'Event';

  // End date
  const endDate = event.date?.end || event.endDate || null;

  // Copy address handler
  const handleCopyAddress = () => {
    const address = event?.place?.address || event.location?.city || '';
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1200);
  };

  const [showEditModal, setShowEditModal] = useLocalState(false);
  const [editData, setEditData] = useLocalState({});
  const [editLoading, setEditLoading] = useLocalState(false);
  const [editError, setEditError] = useLocalState('');

  // Open edit modal with current event data
  const handleEditClick = () => {
    setEditData({
      title: event.title || event.eventName || '',
      description: event.description || '',
      date: event.date?.start || event.date || '',
      endDate: event.date?.end || event.endDate || '',
      time: event.time || '',
      capacity: event.capacity || '',
      type: event.type || event.eventType || '',
      price: event.price || event.fee || 0,
      rsvp: event.rsvpDeadline || event.rsvp || '',
      location: event.place?.address || event.location?.city || '',
      tags: (event.tags || event.tagList || []).join(', '),
    });
    setShowEditModal(true);
    setEditError('');
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form submit
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const eventId = event._id || event.id;
      const payload = {
        title: editData.title,
        description: editData.description,
        date: { start: editData.date, end: editData.endDate },
        time: editData.time,
        capacity: editData.capacity,
        type: editData.type,
        price: editData.price,
        rsvpDeadline: editData.rsvp,
        location: { city: editData.location },
        tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await axios.put(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}`, payload, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowEditModal(false);
      window.location.reload(); // Or refetch event info if using React Query
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update event.');
    } finally {
      setEditLoading(false);
    }
  };

  const [showAnnouncementEdit, setShowAnnouncementEdit] = useLocalState(false);
  const [announcementDraft, setAnnouncementDraft] = useLocalState(event.announcement || '');
  const [announcementLoading, setAnnouncementLoading] = useLocalState(false);
  const [announcementError, setAnnouncementError] = useLocalState('');

  // Save announcement
  const handleAnnouncementSave = async () => {
    setAnnouncementLoading(true);
    setAnnouncementError('');
    try {
      const eventId = event._id || event.id;
      await axios.put(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}`, { announcement: announcementDraft }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setShowAnnouncementEdit(false);
      // Optionally, show a success message or trigger a refetch in parent if needed
    } catch (err) {
      setAnnouncementError(err.response?.data?.error || 'Failed to update announcement.');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 text-gray-700 space-y-4 overflow-x-hidden">
      {/* Announcement Section */}
      <div className="bg-gray-100 rounded-xl p-4 mb-2 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📌</span>
          <span className="font-semibold text-base">Announcement</span>
          {isHost && (
            <button
              onClick={() => setShowAnnouncementEdit(true)}
              className="ml-2 text-xs text-indigo-600 hover:underline focus:outline-none"
            >
              Edit
            </button>
          )}
        </div>
        {event.announcement && !showAnnouncementEdit && (
          <div className="text-gray-800 whitespace-pre-line break-words">{event.announcement}</div>
        )}
        {!event.announcement && !showAnnouncementEdit && (
          <div className="italic text-gray-400">No announcement yet.</div>
        )}
        {/* Edit modal for announcement */}
        {showAnnouncementEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadein">
            <div className="bg-white rounded-lg p-5 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Edit Announcement</h3>
              <textarea
                value={announcementDraft}
                onChange={e => setAnnouncementDraft(e.target.value)}
                className="w-full border rounded px-2 py-1"
                rows={4}
                placeholder="Enter announcement..."
                disabled={announcementLoading}
              />
              {announcementError && <p className="text-red-500 text-xs mt-2">{announcementError}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAnnouncementEdit(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={announcementLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnnouncementSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={announcementLoading}
                >
                  {announcementLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* About Card */}
      <div className="bg-gray-100 rounded-xl p-4 mb-2">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
          <FaInfoCircle className="text-indigo-500" /> About this {type}
        </h2>
        <p className="whitespace-pre-line break-words break-all text-gray-800 text-base animate-fadein">{event.description || 'No description available.'}</p>
      </div>

      {/* Details Card */}
      <div className="bg-gray-100 rounded-xl p-4 mb-2">
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
          <FaCalendarAlt className="text-indigo-500" /> Details
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 justify-start text-gray-600 font-medium"> <FaCalendarAlt className="text-indigo-400" /> Date:</div>
          <div className="flex items-center justify-end">{formatDate(event.date?.start || event.date)}</div>

          {endDate && <><div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaCalendarAlt className="text-indigo-400" /> End Date:</div><div className="flex items-center justify-end">{formatDate(endDate)}</div></>}

          {event.time && <><div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaClock className="text-indigo-400" /> Time:</div><div className="flex items-center justify-end">{formatTime(event.time)}</div></>}

          <div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaUsers className="text-indigo-400" /> Attendees:</div>
          <div className="flex items-center justify-end"><span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}</span></div>

          {event.capacity && <><div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaUsers className="text-indigo-400" /> Capacity:</div><div className="flex items-center justify-end"><span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{event.capacity}</span></div></>}

          <div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaTag className="text-indigo-400" /> Type:</div>
          <div className="flex items-center justify-end">{type}</div>

          {price !== undefined && <><div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaRupeeSign className="text-indigo-400" /> Price:</div><div className="flex items-center justify-end"><span className={`inline-block px-2 py-0.5 rounded-full ${price === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'} text-xs font-semibold`}>{price === 0 ? 'Free' : `₹${price}`}</span></div></>}

          {rsvp && <><div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaClock className="text-indigo-400" /> RSVP by:</div><div className="flex items-center justify-end">{formatDate(rsvp)}</div></>}

          <div className="flex items-center gap-2 justify-start text-gray-600 font-medium"><FaCheckCircle className="text-green-500 animate-pulse" /> Status:</div>
          <div className="flex items-center justify-end">{isClosed ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold"><FaTimesCircle className="text-red-500" /> Closed</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Open</span>}</div>
        </div>
      </div>

      {/* Tags Card */}
      {tags.length > 0 && (
        <div className="bg-gray-100 rounded-xl p-4 mb-2">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
            <FaTag className="text-indigo-500" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={idx} className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${TAG_COLORS[idx % TAG_COLORS.length]} transition-colors duration-200`}>
                {idx === 0 && <FaTag className="mr-1 text-indigo-400 text-xs" />} {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Location Card */}
      <div className="bg-gray-100 rounded-xl p-4 mb-2">
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
          <FaMapMarkerAlt className="text-indigo-500" /> Location
        </h3>
        <div className="flex items-start gap-2 mb-1">
          <FaMapMarkerAlt className="text-indigo-400 mt-0.5" />
          <div className="min-w-0 break-words">
            {event?.place?.name && <div className="font-medium">{event.place.name}</div>}
            <div>{event?.place?.address || event.location?.city || 'Location not specified'}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 max-w-full break-words"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          )}
          <button
            onClick={handleCopyAddress}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-colors"
          >
            <FaMapMarkerAlt className="mr-1.5 text-indigo-400" />
            Copy address
          </button>
          {copySuccess && <span className="text-green-600 text-xs ml-2 animate-fadein">Copied!</span>}
        </div>
      </div>

      {/* Host/Organizer Card */}
      {host && (
        <div
          className="bg-gray-100 rounded-xl p-4 mb-2 flex items-center gap-4 cursor-pointer group"
          title="View profile"
          tabIndex={0}
          onClick={() => host?.id && navigate(`/profile/${host.id}`)}
          onKeyDown={e => { if (e.key === 'Enter' && host?.id) navigate(`/profile/${host.id}`); }}
        >
          {hostAvatar ? (
            <img src={hostAvatar} alt={hostName} className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-50 group-hover:brightness-95 transition-all duration-200" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700 text-xl font-bold border border-gray-200 group-hover:brightness-95 transition-all duration-200">
              {hostName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800 text-base flex items-center gap-1">
              {hostName}
              {host?.verified && <FaCheckCircle className="text-indigo-500 ml-1" title="Verified" />}
            </div>
            <div className="text-xs text-gray-500">{hostRole}{host?.bio && <span className="ml-2 text-gray-400">{host.bio}</span>}</div>
          </div>
        </div>
      )}

      {/* Host Actions (Edit/Delete) */}
      {isHost && (
        <div className="bg-gray-100 rounded-xl p-4 mb-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleEditClick}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              disabled={editLoading}
            >
              Edit
            </button>
            <button 
              onClick={() => setShowConfirmation(true)}
              className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              disabled={isDeleting}
            >
              <FaTrash className="mr-1.5" />
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadein">
          <div className="bg-white rounded-lg p-5 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Edit Group Info</h3>
            <div className="space-y-3">
              <input name="title" value={editData.title} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Title" />
              <textarea name="description" value={editData.description} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Description" rows={3} />
              <input name="date" value={editData.date} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Start Date" type="date" />
              <input name="endDate" value={editData.endDate} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="End Date" type="date" />
              <input name="time" value={editData.time} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Time" type="time" />
              <input name="capacity" value={editData.capacity} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Capacity" type="number" />
              <input name="type" value={editData.type} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Type" />
              <input name="price" value={editData.price} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Price" type="number" />
              <input name="rsvp" value={editData.rsvp} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="RSVP Deadline" type="date" />
              <input name="location" value={editData.location} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Location" />
              <input name="tags" value={editData.tags} onChange={handleEditChange} className="w-full border rounded px-2 py-1" placeholder="Tags (comma separated)" />
            </div>
            {editError && <p className="text-red-500 text-xs mt-2">{editError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadein">
          <div className="bg-white rounded-lg p-5 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Event</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this event? This action is irreversible and all event data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    setError(null);
                    const eventId = event._id || event.id;
                    await axios.delete(`${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'}/api/events/${eventId}`);
                    console.log(`Deleting event at: ${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'}/api/events/${eventId}`);
                    navigate('/explore');
                    window.location.reload();
                  } catch (err) {
                    console.error('Error deleting event:', err);
                    setError('Failed to delete event. Please try again.');
                    setIsDeleting(false);
                    setShowConfirmation(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AboutTab;
