import { EventEmitter } from 'events';
import {
  createConsumer,
  subscribeConsumer,
  consumeEvents,
  deleteConsumer,
} from '../utils/KafkaService';
import dispatcher from '../dispatcher/dispatcher';
import { ADD_USER } from '../actions/userActions';

interface User {
  id: string;
  name: string;
}

class UserStore extends EventEmitter {
  private users: User[] = [];
  private consumerGroupId = 'user-consumer-group';
  private consumerInstanceId = '';

  constructor() {
    super();
    this.initializeConsumer();
  }

  // Return all users
  getAll() {
    return this.users;
  }

  // Initialize Kafka consumer
  private async initializeConsumer() {
    try {
      const consumer = await createConsumer(this.consumerGroupId);
      this.consumerInstanceId = consumer.instance_id;

      await subscribeConsumer(this.consumerGroupId, this.consumerInstanceId, [
        'events-topic',
      ]);

      this.consumeKafkaEvents();
    } catch (err) {
      console.error('Error initializing Kafka consumer:', err);
    }
  }

  // Consume Kafka events in real-time
  private async consumeKafkaEvents() {
    try {
      while (true) {
        const events = await consumeEvents(
          this.consumerGroupId,
          this.consumerInstanceId
        );
        if (!events) continue; // Skip if no events
        events.forEach((event) => { 
          if (event.eventType === 'USER_CREATED') {
            console.log('Processing USER_CREATED event:', event); // Log specific event details
            this.users.push(event.payload);
            this.emit('change'); // Notify listeners of the update
          }
        });
      }
    } catch (err) {
      console.error('Error consuming Kafka events:', err);
    }
  }

  // Cleanup consumer on shutdown
  async cleanup() {
    try {
      if (this.consumerInstanceId) {
        await deleteConsumer(this.consumerGroupId, this.consumerInstanceId);
      }
    } catch (err) {
      console.error('Error cleaning up Kafka consumer:', err);
    }
  }

  // Handle dispatched actions
  handleActions(action: any) {
    switch (action.type) {
      case ADD_USER:
        this.users.push(action.user);
        this.emit('change');
        break;

      default:
        break;
    }
  }
}

const userStore = new UserStore();
dispatcher.register(userStore.handleActions.bind(userStore));

export default userStore;
