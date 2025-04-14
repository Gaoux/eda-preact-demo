import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';

interface Property {
  id: string;
  name: string;
  price: number;
}

class PropertyStore extends EventEmitter {
  private properties: Property[] = [];

  // Get properties
  getProperties() {
    return this.properties;
  }

  // Handle actions dispatched by the dispatcher
  handleActions(action: {
    type: string;
    property?: Property;
    propertyId?: string;
  }) {
    switch (action.type) {
      case 'ADD_PROPERTY':
        if (action.property) this.properties.push(action.property);
        this.emit('change');
        break;
      case 'REMOVE_PROPERTY':
        this.properties = this.properties.filter(
          (property) => property.id !== action.propertyId
        );
        this.emit('change');
        break;
      default:
        break;
    }
  }
}

const propertyStore = new PropertyStore();
dispatcher.register(propertyStore.handleActions.bind(propertyStore));

export default propertyStore;
