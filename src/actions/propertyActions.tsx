import AppDispatcher from '../dispatcher/dispatcher';
import userStore from '../stores/userStore'; // Import the user store

export const ADD_PROPERTY = 'ADD_PROPERTY';
export const REMOVE_PROPERTY = 'REMOVE_PROPERTY';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string; // The ID of the user (owner)
}

const PropertyActions = {
  // Add property action
  addProperty(property: Property) {
    // Ensure the property owner exists (ownerId must be in userStore)
    const ownerExists = userStore
      .getUsers()
      .some((user) => user.id === property.ownerId);

    if (ownerExists) {
      AppDispatcher.dispatch({
        type: ADD_PROPERTY,
        property,
      });
    } else {
      console.error(`Error: User with ID ${property.ownerId} does not exist.`);
    }
  },

  // Remove property action
  removeProperty(propertyId: string) {
    AppDispatcher.dispatch({
      type: REMOVE_PROPERTY,
      propertyId,
    });
  },
};

export default PropertyActions;
