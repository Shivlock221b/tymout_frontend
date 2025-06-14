// Mock data for events the user has attended
// Each ticket contains: id, eventName, date, location, ticketCode, status, and thumbnail

const myEventsTickets = [
  {
    id: 'evt1',
    eventName: 'React Summit 2024',
    date: '2024-03-15',
    location: 'Bangalore, India',
    ticketCode: 'RS24-001',
    status: 'Attended',
    thumbnail: '/assets/event-thumbs/react-summit.png',
    bio: 'The largest React community gathering in India. 🚀 #ReactSummit2024',
    photos: [
      '/assets/event-photos/evt1-1.jpg',
      '/assets/event-photos/evt1-2.jpg',
      '/assets/event-photos/evt1-3.jpg'
    ]
  },
  {
    id: 'evt2',
    eventName: 'Node.js Conf',
    date: '2024-01-20',
    location: 'Delhi, India',
    ticketCode: 'NODE24-045',
    status: 'Attended',
    thumbnail: '/assets/event-thumbs/node-conf.png',
    bio: 'Connect, code, and collaborate with Node.js enthusiasts.',
    photos: [
      '/assets/event-photos/evt2-1.jpg',
      '/assets/event-photos/evt2-2.jpg'
    ]
  },
  {
    id: 'evt3',
    eventName: 'Design Systems Meetup',
    date: '2023-12-10',
    location: 'Mumbai, India',
    ticketCode: 'DSM23-112',
    status: 'Attended',
    thumbnail: '/assets/event-thumbs/design-meetup.png',
    bio: 'Where design thinkers meet to inspire and create.',
    photos: [
      '/assets/event-photos/evt3-1.jpg',
      '/assets/event-photos/evt3-2.jpg',
      '/assets/event-photos/evt3-3.jpg'
    ]
  },
  {
    id: 'evt4',
    eventName: 'Bio Folding Test Event',
    date: '2025-05-01',
    location: 'Test City',
    ticketCode: 'BIO90-TEST',
    status: 'Attended',
    thumbnail: '/assets/event-thumbs/test-event.png',
    bio: 'This is a test event bio to check the folding functionality. It is intentionally longer than one hundred characters so we can see the “more...” link in action and ensure only the first 45 characters are shown by default. #TestingBioFold',
    photos: [
      '/assets/event-photos/evt4-1.jpg',
      '/assets/event-photos/evt4-2.jpg'
    ]
  }
];

export default myEventsTickets;
