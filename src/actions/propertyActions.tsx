import AppDispatcher from '../dispatcher/dispatcher';

export const ADD_PROPERTY = 'ADD_PROPERTY';
export const REMOVE_PROPERTY = 'REMOVE_PROPERTY';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string;
}

// Add Property Action
export function addProperty(property: Property) {
  // Call the Go API Gateway to emit the event to Kafka
  fetch('http://localhost:8080/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType: ADD_PROPERTY,
      payload: property,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to send add-property event');
      }
      return res.json();
    })
    .then((data) => {
      // Dispatch to Flux for local state handling (optional)
      AppDispatcher.dispatch({
        type: ADD_PROPERTY,
        property: data.property, // in case backend responds with the created property
      });
    })
    .catch((err) => {
      console.error('Error sending add-property event:', err);
    });
}

// Remove Property Action
export function removeProperty(propertyId: string) {
  // Call the Go API Gateway to emit the event to Kafka
  fetch('http://localhost:8080/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType: REMOVE_PROPERTY,
      payload: { id: propertyId },
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to send remove-property event');
      }
      return res.json();
    })
    .then((data) => {
      // Dispatch to Flux for local state handling (optional)
      AppDispatcher.dispatch({
        type: REMOVE_PROPERTY,
        propertyId: data.propertyId, // in case backend responds with the removed property ID
      });
    })
    .catch((err) => {
      console.error('Error sending remove-property event:', err);
    });
}
