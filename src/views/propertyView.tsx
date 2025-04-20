import { h, Component } from 'preact';
import propertyStore from '../stores/propertyStore';
import * as propertyActions from '../actions/propertyActions';
import userStore from '../stores/userStore';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string;
}

interface PropertyViewState {
  properties: Property[];
  newPropertyName: string;
  newPropertyPrice: string;
  ownerId: string;
  isLoading: boolean;
  error?: string;
  availableUsers: { id: string; name: string }[];
}

class PropertyView extends Component<{}, PropertyViewState> {
  constructor() {
    super();
    this.state = {
      properties: propertyStore.getProperties(),
      newPropertyName: '',
      newPropertyPrice: '',
      ownerId: '',
      isLoading: false,
      availableUsers: [],
    };
  }

  componentDidMount() {
    propertyStore.addListener('change', this.handleStoreChange);
    userStore.addListener('change', this.updateAvailableUsers);
    this.updateAvailableUsers();
  }

  componentWillUnmount() {
    propertyStore.removeListener('change', this.handleStoreChange);
    userStore.removeListener('change', this.updateAvailableUsers);
  }

  private handleStoreChange = () => {
    this.setState({ properties: propertyStore.getProperties() });
  };

  private updateAvailableUsers = () => {
    this.setState({
      availableUsers: userStore.getAll().map((user) => ({
        id: user.id,
        name: user.name,
      })),
    });
  };

  private handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this.setState({
      [target.name]: target.value,
    } as unknown as PropertyViewState);
  };

  private validateForm = (): boolean => {
    const { newPropertyName, newPropertyPrice, ownerId } = this.state;
    const price = parseFloat(newPropertyPrice);

    if (!newPropertyName.trim()) {
      this.setState({ error: 'Property name is required' });
      return false;
    }

    if (isNaN(price)) {
      this.setState({ error: 'Price must be a valid number' });
      return false;
    }

    if (price <= 0) {
      this.setState({ error: 'Price must be greater than 0' });
      return false;
    }

    if (!ownerId) {
      this.setState({ error: 'Owner must be selected' });
      return false;
    }

    this.setState({ error: undefined });
    return true;
  };

  private handleAddProperty = async (e: Event) => {
    e.preventDefault();
    if (!this.validateForm()) return;

    const { newPropertyName, newPropertyPrice, ownerId } = this.state;
    const price = parseFloat(newPropertyPrice);

    this.setState({ isLoading: true });

    try {
      const newProperty: Property = {
        id: Date.now().toString(),
        name: newPropertyName.trim(),
        price,
        ownerId,
      };

      await propertyActions.addProperty(newProperty);
      this.setState({
        newPropertyName: '',
        newPropertyPrice: '',
        ownerId: '',
      });
    } catch (error) {
      this.setState({
        error:
          error instanceof Error ? error.message : 'Failed to add property',
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  private handleRemoveProperty = async (id: string) => {
    this.setState({ isLoading: true });
    try {
      await propertyActions.removeProperty(id);
    } catch (error) {
      this.setState({
        error:
          error instanceof Error ? error.message : 'Failed to remove property',
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const {
      properties,
      newPropertyName,
      newPropertyPrice,
      ownerId,
      isLoading,
      error,
      availableUsers,
    } = this.state;

    return (
      <div class='property-view'>
        <h1>Property Management</h1>

        {error && (
          <div class='error-message'>
            {error}
            <button onClick={() => this.setState({ error: undefined })}>
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={this.handleAddProperty} class='property-form'>
          <div class='form-group'>
            <label for='propertyName'>Property Name</label>
            <input
              id='propertyName'
              type='text'
              name='newPropertyName'
              value={newPropertyName}
              placeholder='Enter property name'
              onInput={this.handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div class='form-group'>
            <label for='propertyPrice'>Price ($)</label>
            <input
              id='propertyPrice'
              type='number'
              name='newPropertyPrice'
              value={newPropertyPrice}
              placeholder='Enter price'
              onInput={this.handleInputChange}
              disabled={isLoading}
              min='1'
              step='0.01'
              required
            />
          </div>

          <div class='form-group'>
            <label for='propertyOwner'>Owner</label>
            <select
              id='propertyOwner'
              name='ownerId'
              value={ownerId}
              onInput={this.handleInputChange}
              disabled={isLoading || availableUsers.length === 0}
              required
            >
              <option value=''>Select Owner</option>
              {availableUsers.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.name} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type='submit'
            disabled={isLoading || availableUsers.length === 0}
            class='submit-button'
          >
            {isLoading ? 'Adding...' : 'Add Property'}
          </button>
        </form>

        <div class='property-list'>
          <h2>Current Properties</h2>
          {properties.length === 0 ? (
            <p>No properties available</p>
          ) : (
            <ul>
              {properties.map((property) => {
                const owner = availableUsers.find(
                  (u) => u.id === property.ownerId
                );
                return (
                  <li key={property.id} class='property-item'>
                    <div class='property-info'>
                      <h3>{property.name}</h3>
                      <p>Price: ${property.price.toLocaleString()}</p>
                      <p>
                        Owner: {owner ? owner.name : 'Unknown'} (ID:{' '}
                        {property.ownerId})
                      </p>
                    </div>
                    <button
                      onClick={() => this.handleRemoveProperty(property.id)}
                      disabled={isLoading}
                      class='remove-button'
                    >
                      {isLoading ? 'Removing...' : 'Remove'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default PropertyView;
