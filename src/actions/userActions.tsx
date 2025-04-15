import AppDispatcher from '../dispatcher/dispatcher';
import { produceEvent } from '../utils/KafkaService';

// Action types
const ADD_USER = 'add-user';
const USER_ACTION_ERROR = 'user-action-error';

// Interface for user action payload
interface UserActionPayload {
  name: string;
  email?: string;
  [key: string]: any; // Additional flexible properties
}

// Interface for Kafka user event
interface KafkaUserEvent {
  type: string;
  user: UserActionPayload;
  timestamp: string;
  metadata?: {
    source: 'frontend';
    sessionId?: string;
    [key: string]: any;
  };
}

const UserActions = {
  /**
   * Add a new user - dispatches locally and sends to Kafka via REST Proxy
   */
  async addUser(payload: UserActionPayload): Promise<void> {
    try {
      // 1. Dispatch locally first (optimistic update)
      AppDispatcher.dispatch({
        type: ADD_USER,
        payload,
      });

      // 2. Prepare Kafka event
      const event: KafkaUserEvent = {
        type: 'USER_CREATED',
        user: payload,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'frontend',
          sessionId: window.sessionStorage.getItem('sessionId') || undefined,
        },
      };

      // 3. Send to Kafka via REST Proxy
      await produceEvent('user-events', event);
      console.debug('User event sent to Kafka:', payload.name);
    } catch (error) {
      console.error('Error in addUser action:', error);
      // Dispatch error action
      AppDispatcher.dispatch({
        type: USER_ACTION_ERROR,
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
          originalPayload: payload,
        },
      });
    }
  },

  /**
   * Health check for Kafka connection
   */
  async checkKafkaHealth(): Promise<boolean> {
    try {
      // Test connection by trying to create a temporary consumer
      const testGroupId = 'health-check-' + Date.now();
      await produceEvent('health-checks', {
        type: 'HEALTH_CHECK',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  },
};

export default UserActions;
