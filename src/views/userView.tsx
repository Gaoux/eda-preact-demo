import { h, Component } from 'preact';
import userStore from '../stores/userStore';
import * as UserActions from '../actions/userActions';

interface User {
  id: string;
  name: string;
}

interface UserViewState {
  users: User[];
  isLoading: boolean;
  error?: string;
}

class UserView extends Component<{}, UserViewState> {
  private newUserInput!: HTMLInputElement;

  constructor() {
    super();
    this.state = {
      users: userStore.getAll(),
      isLoading: false,
      error: undefined,
    };
    this.handleAddUser = this.handleAddUser.bind(this); // Bind method explicitly
  }

  componentDidMount() {
    userStore.addListener('change', this.handleStoreChange);
  }

  componentWillUnmount() {
    userStore.removeListener('change', this.handleStoreChange);
  }

  private handleStoreChange = () => {
    this.setState({ users: userStore.getAll() });
  };

  private handleAddUser = async (e: Event) => {
    e.preventDefault();
    const name = this.newUserInput.value.trim();
    if (!name) return;

    this.setState({ isLoading: true, error: undefined });

    try {
      await UserActions.addUser(name);
      this.newUserInput.value = '';
    } catch (error) {
      console.error('Caught error:', error); // Log the error
      this.setState(
        {
          error: error instanceof Error ? error.message : 'Failed to add user',
        },
        () => {
          console.log('Updated state:', this.state); // Confirm state update
        }
      );
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { users, isLoading, error } = this.state;

    return (
      <div class='view-container'>
        <div class='list-container'>
          <h1>User List</h1>

          {error && <div class='error-message'>Error: {error}</div>}

          {isLoading && <div class='loading-indicator'>Processing...</div>}

          <ul class='user-list'>
            {users.map((user) => (
              <li key={user.id} class='user-item'>
                <span class='user-id'>{user.id}</span>
                <span class='user-name'>{user.name}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={this.handleAddUser} class='user-form'>
            <input
              type='text'
              ref={(el) => {
                this.newUserInput = el as HTMLInputElement;
              }}
              placeholder='Enter user name'
              required
              disabled={isLoading}
            />
            <button type='submit' disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default UserView;
