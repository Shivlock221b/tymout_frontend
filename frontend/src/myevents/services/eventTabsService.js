// eventTabsService.js
// Service for fetching event tabs (could be static or from event data)
export function getEventTabs() {
  // Example: static tabs for all events
  return Promise.resolve([
    { key: 'moments', label: 'Moments' },
    { key: 'members', label: 'Members' },
    { key: 'about', label: 'About' },
    { key: 'chat', label: 'Chat' },
  ]);
}
