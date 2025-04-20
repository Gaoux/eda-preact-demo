import AppDispatcher from '../dispatcher/dispatcher';

// Action types
export const ADD_USER = 'add-user';

export function addUser(name: string) {
  // Call the Go API Gateway to emit the event to Kafka
  fetch('http://localhost:8080/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType: ADD_USER,
      payload: { name },
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to send event');
      }
      return res.json();
    })
    .then((data) => {
      // Dispatch to Flux for local state handling (optional)
      AppDispatcher.dispatch({
        type: ADD_USER,
        user: data.user, // in case backend responds with user object (id + name)
      });
    })
    .catch((err) => {
      console.error('Error sending event:', err);
    });
}
