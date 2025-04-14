import AppDispatcher from '../dispatcher/dispatcher';

export const ADD_USER = 'add-user';

interface UserAction {
  type: string;
  payload: { name: string };
}

const UserActions = {
  addUser(name: string) {
    AppDispatcher.dispatch({
      type: ADD_USER,
      payload: { name },
    });
  },
};

export default UserActions;
