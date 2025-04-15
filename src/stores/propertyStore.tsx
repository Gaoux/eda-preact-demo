import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';
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

interface KafkaPropertyEvent {
  type: string;
  property?: Property;
  propertyId?: string;
  timestamp: string;
}

class PropertyStore extends EventEmitter {
  private properties: Property[] = [];
  private consumerGroupId = 'property-store-group';
  private consumerInstance: string | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeKafkaConsumer();
    dispatcher.register(this.handleActions.bind(this));
  }

  public getProperties(): Property[] {
    return this.properties;
  }

  private async initializeKafkaConsumer() {
    try {
      // Create Kafka consumer instance
      const consumer = await createConsumer(this.consumerGroupId);
      this.consumerInstance = consumer.instance_id;

      // Subscribe to topics
      await subscribeConsumer(this.consumerGroupId, this.consumerInstance, [
        'property-topic',
      ]);

      // Start polling for messages (every 2 seconds)
      this.pollInterval = setInterval(async () => {
        try {
          const messages = await consumeEvents(
            this.consumerGroupId,
            this.consumerInstance!
          );
          this.processKafkaMessages(messages);
        } catch (error) {
          console.error('Error consuming property messages:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to initialize Kafka consumer:', error);
      // Implement retry logic here if needed
    }
  }

  private processKafkaMessages(messages: any[]) {
    let changed = false;

    messages.forEach((message) => {
      const event: KafkaPropertyEvent = message.value;

      switch (event.type) {
        case 'ADD_PROPERTY':
          if (event.property) {
            this.addProperty(event.property);
            changed = true;
          }
          break;

        case 'REMOVE_PROPERTY':
          if (event.propertyId) {
            this.removeProperty(event.propertyId);
            changed = true;
          }
          break;

        default:
          console.warn('Unknown property event type:', event.type);
      }
    });

    if (changed) {
      this.emit('change');
    }
  }

  public handleActions(action: {
    type: string;
    property?: Property;
    propertyId?: string;
  }) {
    switch (action.type) {
      case 'ADD_PROPERTY':
        if (action.property) this.addProperty(action.property);
        break;
      case 'REMOVE_PROPERTY':
        if (action.propertyId) this.removeProperty(action.propertyId);
        break;
      default:
        break;
    }
  }

  private addProperty(property: Property) {
    // Check for duplicates
    if (!this.properties.some((p) => p.id === property.id)) {
      this.properties.push(property);
      this.emit('change');
    }
  }

  private removeProperty(propertyId: string) {
    const initialLength = this.properties.length;
    this.properties = this.properties.filter((p) => p.id !== propertyId);
    if (this.properties.length !== initialLength) {
      this.emit('change');
    }
  }

  public async cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.consumerInstance) {
      try {
        await deleteConsumer(this.consumerGroupId, this.consumerInstance);
        console.log('Kafka consumer cleaned up');
      } catch (error) {
        console.error('Error cleaning up consumer:', error);
      }
    }
  }
}

const propertyStore = new PropertyStore();

// Cleanup on window unload (if in browser environment)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    propertyStore.cleanup().catch(console.error);
  });
}

export default propertyStore;
