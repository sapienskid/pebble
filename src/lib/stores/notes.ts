import { writable } from 'svelte/store';

export const notesStore = writable<Note[]>([
  {
    id: '1',
    content: 'Project Zenith kickoff - new ideas for Q3 campaigns, target audience, and content.',
    timestamp: '2024-08-15T12:00:00Z',
    tags: [],
  },
  {
    id: '2',
    content: 'Brainstorming session for Project Zenith. Focus on Q3 campaign audience and content.',
    timestamp: '2024-08-15T12:30:00Z',
    tags: [],
  },
  {
    id: '3',
    content: 'Discover groundbreaking ideas that redefine the future. Explore our innovative concepts.',
    timestamp: '2024-07-24T13:00:00Z',
    tags: [],
  },
  {
    id: '4',
    content: 'Try a "think-alone session" before sharing ideas. Or, use the "systematic" techniques.',
    timestamp: '2024-08-01T14:00:00Z',
    tags: [],
  },
  {
    id: '5',
    content: 'Consider using the "brainstorming" method to encourage collaborative thinking.',
    timestamp: '2024-08-01T14:00:00Z',
    tags: [],
  },
]);