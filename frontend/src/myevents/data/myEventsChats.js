// Mock chat messages for events
// Each chat: id, eventId, messages: [{id, sender, text, timestamp}]

const myEventsChats = [
  {
    eventId: 'evt1',
    messages: [
      { id: 'm1', sender: 'You', text: 'Excited for React Summit!', timestamp: '2024-03-10T10:00:00Z' },
      { id: 'm2', sender: 'Alice', text: 'Me too! See you there!', timestamp: '2024-03-10T10:01:00Z' }
    ]
  },
  {
    eventId: 'evt2',
    messages: [
      { id: 'm1', sender: 'You', text: 'Node.js Conf is going to be awesome.', timestamp: '2024-01-15T14:00:00Z' }
    ]
  },
  {
    eventId: 'evt4',
    messages: [
      { id: 'm1', sender: 'You', text: 'Testing the chat folding!', timestamp: '2025-05-01T12:00:00Z' }
    ]
  }
];

export default myEventsChats;
