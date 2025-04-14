import { EventEmitter } from 'events';
import dispatcher from '../dispatcher/dispatcher';
import { ADD_USER } from '../actions/userActions';

interface User {
  id: string;
  name: string;
}

class UserStore extends EventEmitter {
  private users: User[] = [];
  private idCounter: number = 1;

  constructor() {
    super();
  }

  getUsers(): User[] {
    return this.users;
  }

  handleActions(action: any) {
    switch (action.type) {
      case ADD_USER:
        // Automatically assign an id to the new user
        const newUser: User = {
          id: String(this.idCounter++), // Incremental ID
          name: action.payload.name,
        };
        this.users.push(newUser);
        this.emit('change');
        break;
      // You can add the REMOVE_USER logic as needed.
    }
  }
}

const userStore = new UserStore();
dispatcher.register(userStore.handleActions.bind(userStore));

export default userStore;
