import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';
import { ADD_USER } from '../actions/userActions';

interface User {
  id: string;
  name: string;
}

class UserStore extends EventEmitter {
  private users: User[] = [];

  // Return all users
  getAll() {
    return this.users;
  }

  // Internal method to handle dispatched actions
  handleActions(action: any) {
    switch (action.type) {
      case ADD_USER:
        // Add the new user (with ID from backend)
        this.users.push({
          id: action.user.id,
          name: action.user.name,
        });

        // Emit change so components can re-render
        this.emit('change');
        break;

      default:
        // No-op for unrecognized actions
        break;
    }
  }
}

// Instantiate and register the store
const userStore = new UserStore();
dispatcher.register(userStore.handleActions.bind(userStore));

export default userStore;
