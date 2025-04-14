import { h, Component } from 'preact';
import userStore from '../stores/userStore';
import UserActions from '../actions/userActions';

interface User {
  id: string;
  name: string;
}

interface UserViewState {
  users: User[];
}

class UserView extends Component<{}, UserViewState> {
  constructor() {
    super();
    this.state = {
      users: userStore.getUsers(),
    };
  }

  componentDidMount() {
    userStore.on('change', this.updateState);
  }

  componentWillUnmount() {
    userStore.removeListener('change', this.updateState);
  }

  updateState = () => {
    this.setState({ users: userStore.getUsers() });
  };

  handleAddUser = () => {
    const newUserName = `User ${Date.now()}`; // Unique user name based on timestamp
    UserActions.addUser(newUserName); // Call addUser with the name
  };

  render() {
    return (
      <div className='view-container'>
        <div className='list-container'>
          <h1>User List</h1>
          <ul>
            {this.state.users.map((user) => (
              <li key={user.id}>
                {user.id}: {user.name}
              </li>
            ))}
          </ul>
          <button onClick={this.handleAddUser}>Add User</button>
        </div>
      </div>
    );
  }
}

export default UserView;
