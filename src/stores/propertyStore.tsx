import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string;
}

class PropertyStore extends EventEmitter {
  private properties: Property[] = [];

  // Get current properties
  getProperties() {
    return this.properties;
  }

  // Handle add property action
  private handleAddProperty(property: Property) {
    this.properties.push(property);
    this.emit('change'); // Emit change when properties list updates
  }

  // Handle remove property action
  private handleRemoveProperty(propertyId: string) {
    this.properties = this.properties.filter(
      (property) => property.id !== propertyId
    );
    this.emit('change'); // Emit change when a property is removed
  }

  // Dispatcher registration to listen to actions
  constructor() {
    super();
    dispatcher.register((action) => {
      switch (action.type) {
        case 'ADD_PROPERTY':
          this.handleAddProperty(action.property);
          break;
        case 'REMOVE_PROPERTY':
          this.handleRemoveProperty(action.propertyId);
          break;
        default:
          break;
      }
    });
  }
}

const propertyStore = new PropertyStore();
export default propertyStore;
