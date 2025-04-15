import { h, Component } from 'preact';
import userStore from '../stores/userStore';
import UserActions from '../actions/userActions';

interface User {
  id: string;
  name: string;
  email?: string;
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
      users: userStore.getUsers(),
      isLoading: false,
    };
  }

  componentDidMount() {
    userStore.addListener('change', this.handleStoreChange);
    this.checkKafkaConnection();
  }

  componentWillUnmount() {
    userStore.removeListener('change', this.handleStoreChange);
  }

  private handleStoreChange = () => {
    this.setState({ users: userStore.getUsers() });
  };

  private checkKafkaConnection = async () => {
    this.setState({ isLoading: true });
    try {
      const isHealthy = await UserActions.checkKafkaHealth();
      if (!isHealthy) {
        this.setState({ error: 'Connection to Kafka service failed' });
      }
    } catch (error) {
      this.setState({
        error:
          error instanceof Error ? error.message : 'Kafka connection error',
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  private handleAddUser = async (e: Event) => {
    e.preventDefault();
    const name = this.newUserInput.value.trim();
    if (!name) return;

    this.setState({ isLoading: true, error: undefined });

    try {
      await UserActions.addUser({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      });
      this.newUserInput.value = '';
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to add user',
      });
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

          {error && (
            <div class='error-message'>
              Error: {error}
              <button onClick={this.checkKafkaConnection}>
                Retry Connection
              </button>
            </div>
          )}

          {isLoading && <div class='loading-indicator'>Processing...</div>}

          <ul class='user-list'>
            {users.map((user) => (
              <li key={user.id} class='user-item'>
                <span class='user-id'>{user.id}</span>
                <span class='user-name'>{user.name}</span>
                {user.email && <span class='user-email'>{user.email}</span>}
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
