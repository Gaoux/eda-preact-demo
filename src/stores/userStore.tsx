import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';
import { 
  createConsumer, 
  subscribeConsumer, 
  consumeEvents,
  deleteConsumer
} from '../utils/KafkaService';

interface User {
  id: string;
  name: string;
}

interface KafkaEvent {
  type: string;
  user?: {
    name: string;
  };
}

class UserStore extends EventEmitter {
  private users: User[] = [];
  private idCounter: number = 1;
  private consumerGroupId = 'user-store-group';
  private consumerInstance: string | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeKafkaConsumer();
    dispatcher.register(this.handleActions.bind(this));
  }

  public getUsers(): User[] {
    return this.users;
  }

  private async initializeKafkaConsumer() {
    try {
      // Create Kafka consumer instance
      const consumer = await createConsumer(this.consumerGroupId);
      this.consumerInstance = consumer.instance_id;
      
      // Subscribe to topics
      await subscribeConsumer(this.consumerGroupId, this.consumerInstance, ['user-events']);
      
      // Start polling for messages
      this.pollInterval = setInterval(async () => {
        try {
          const messages = await consumeEvents(this.consumerGroupId, this.consumerInstance!);
          this.processKafkaMessages(messages);
        } catch (error) {
          console.error('Error consuming messages:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize Kafka consumer:', error);
    }
  }

  private processKafkaMessages(messages: any[]) {
    let changed = false;
    
    messages.forEach(message => {
      const event: KafkaEvent = message.value;
      
      if (event.type === 'USER_CREATED' && event.user) {
        const newUser: User = {
          id: String(this.idCounter++),
          name: event.user.name
        };
        this.users.push(newUser);
        changed = true;
      }
    });

    if (changed) {
      this.emit('change');
    }
  }

  public handleActions(action: any) {
    switch (action.type) {
      case 'REMOVE_USER':
        this.users = this.users.filter(user => user.id !== action.id);
        this.emit('change');
        break;
      // Add other action handlers as needed
      default:
        break;
    }
  }

  public cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.consumerInstance) {
      deleteConsumer(this.consumerGroupId, this.consumerInstance)
        .catch(error => console.error('Error cleaning up consumer:', error));
    }
  }
}

const userStore = new UserStore();

// Cleanup on window unload (optional)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => userStore.cleanup());
}

export default userStore;