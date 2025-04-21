import { produceEvent } from '../utils/KafkaService';

// Action types
export const ADD_USER = 'ADD_USER';

export function addUser(name: string) {
  const eventPayload = {
    eventType: ADD_USER,
    payload: { name },
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
