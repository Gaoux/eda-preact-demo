import AppDispatcher from '../dispatcher/dispatcher';
import { produceEvent } from '../utils/KafkaService';

export const ADD_PROPERTY = 'ADD_PROPERTY';
export const REMOVE_PROPERTY = 'REMOVE_PROPERTY';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string;
}

export function addProperty(property: Omit<Property, 'id'>) {
  const eventPayload = {
    eventType: ADD_PROPERTY,
    payload: {
      name: property.name,
      price: property.price,
      ownerId: property.ownerId,
    },
  };

  // Produce the event directly to Kafka
  produceEvent('events-topic', eventPayload)
    .then(() => {
      console.log('Event successfully produced to Kafka:', eventPayload);
    })
    .catch((err) => {
      console.error('Error producing event to Kafka:', err);
    });
}

// Remove Property Action
export function removeProperty(propertyId: string) {
  const eventPayload = {
    eventType: REMOVE_PROPERTY, // Ensure this matches the backend's expected event type
    payload: { id: propertyId },
  };

  // Log the event payload for debugging
  console.log('Sending remove-property event to backend:', eventPayload);

  fetch('http://localhost:8080/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to send remove-property event');
      }
      return res.json();
    })
    .then((data) => {
      console.log('Received response from backend:', data);

      AppDispatcher.dispatch({
        type: REMOVE_PROPERTY,
        propertyId: data.propertyId, // Backend should return the removed property ID
      });
    })
    .catch((err) => {
      console.error('Error sending remove-property event:', err);
    });
}
