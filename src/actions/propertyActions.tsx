import AppDispatcher from '../dispatcher/dispatcher';
import userStore from '../stores/userStore';
import { produceEvent } from '../utils/KafkaService';

export const ADD_PROPERTY = 'ADD_PROPERTY';
export const REMOVE_PROPERTY = 'REMOVE_PROPERTY';
export const PROPERTY_ERROR = 'PROPERTY_ERROR';

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
  metadata?: {
    source: 'frontend';
    [key: string]: any;
  };
}

const PropertyActions = {
  /**
   * Add a new property with owner validation
   */
  async addProperty(property: Property): Promise<void> {
    try {
      // Validate owner exists
      const ownerExists = userStore
        .getUsers()
        .some((user) => user.id === property.ownerId);

      if (!ownerExists) {
        throw new Error(`User with ID ${property.ownerId} does not exist`);
      }

      // Dispatch optimistic update
      AppDispatcher.dispatch({
        type: ADD_PROPERTY,
        property,
      });

      // Create Kafka event
      const event: KafkaPropertyEvent = {
        type: ADD_PROPERTY,
        property,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'frontend',
          sessionId: window.sessionStorage.getItem('sessionId') || undefined,
        },
      };

      // Send to Kafka via REST Proxy
      await produceEvent('property-topic', event);
      console.debug('Property added via Kafka:', property.name);
    } catch (error) {
      console.error('Error in addProperty:', error);
      AppDispatcher.dispatch({
        type: PROPERTY_ERROR,
        payload: {
          error:
            error instanceof Error ? error.message : 'Failed to add property',
          originalPayload: property,
        },
      });
    }
  },

  /**
   * Remove a property
   */
  async removeProperty(propertyId: string): Promise<void> {
    try {
      // Dispatch optimistic update
      AppDispatcher.dispatch({
        type: REMOVE_PROPERTY,
        propertyId,
      });

      // Create Kafka event
      const event: KafkaPropertyEvent = {
        type: REMOVE_PROPERTY,
        propertyId,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'frontend',
          action: 'property_removal',
        },
      };

      // Send to Kafka via REST Proxy
      await produceEvent('property-topic', event);
      console.debug('Property removed via Kafka:', propertyId);
    } catch (error) {
      console.error('Error in removeProperty:', error);
      AppDispatcher.dispatch({
        type: PROPERTY_ERROR,
        payload: {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to remove property',
          propertyId,
        },
      });
    }
  },

  /**
   * Health check for Kafka connection
   */
  async checkKafkaHealth(): Promise<boolean> {
    try {
      // Test connection by sending a small health check event
      await produceEvent('health-checks', {
        type: 'PROPERTY_SERVICE_HEALTH_CHECK',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Kafka health check failed:', error);
      return false;
    }
  },
};

export default PropertyActions;
