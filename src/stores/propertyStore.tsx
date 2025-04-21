import { EventEmitter } from 'events';
import {
  createConsumer,
  subscribeConsumer,
  consumeEvents,
  deleteConsumer,
} from '../utils/KafkaService';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string;
}

class PropertyStore extends EventEmitter {
  private properties: Property[] = [];
  private consumerGroupId = 'property-consumer-group';
  private consumerInstanceId = '';

  constructor() {
    super();
    this.initializeConsumer();
  }

  // Get current properties
  getProperties() {
    return this.properties;
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
          if (event.eventType === 'PROPERTY_CREATED') {
            console.log('Processing PROPERTY_CREATED event:', event); // Log specific event details

            // Validate the payload structure
            if (
              event.payload &&
              event.payload.id &&
              event.payload.name &&
              event.payload.price &&
              event.payload.ownerId
            ) {
              this.properties.push(event.payload);
              this.emit('change'); // Notify listeners of the update
            } else {
              console.error('Invalid event payload structure:', event.payload);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error consuming Kafka property events:', err);
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
}

const propertyStore = new PropertyStore();
export default propertyStore;
