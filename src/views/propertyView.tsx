import { h, Component } from 'preact';
import propertyStore from '../stores/propertyStore';
import propertyActions from '../actions/propertyActions';

interface Property {
  id: string;
  name: string;
  price: number;
  ownerId: string; // Owner ID for each property
}

interface PropertyViewState {
  properties: Property[];
  newPropertyName: string;
  newPropertyPrice: number;
  ownerId: string; // Owner's ID (this could be dynamically fetched from a user store or props)
}

class PropertyView extends Component<{}, PropertyViewState> {
  constructor() {
    super();
    this.state = {
      properties: propertyStore.getProperties(),
      newPropertyName: '',
      newPropertyPrice: 0,
      ownerId: '1', // Hardcoded ownerId for demo purposes, this should be dynamic (e.g., from a user store)
    };
  }

  componentDidMount() {
    propertyStore.on('change', this.updateState);
  }

  componentWillUnmount() {
    propertyStore.removeListener('change', this.updateState);
  }

  updateState = () => {
    this.setState({ properties: propertyStore.getProperties() });
  };

  handleAddProperty = () => {
    const { newPropertyName, newPropertyPrice, ownerId } = this.state;
    const id = Date.now().toString();

    // Validate that the owner exists (this can be linked to your user store validation)
    const newProperty = {
      id,
      name: newPropertyName || `Property ${id}`,
      price: newPropertyPrice || Math.floor(Math.random() * 1000) + 100, // Random price for demo
      ownerId,
    };

    // Add the property with the ownerId
    propertyActions.addProperty(newProperty);
    this.setState({ newPropertyName: '', newPropertyPrice: 0 }); // Reset input fields
  };

  handleRemoveProperty = (id: string) => {
    propertyActions.removeProperty(id);
  };

  handleInputChange = (e: Event) => {
    const { name, value } = e.target as HTMLInputElement;
    this.setState({ [name]: value } as unknown as PropertyViewState);
  };

  render() {
    const { properties, newPropertyName, newPropertyPrice, ownerId } =
      this.state;

    return (
      <div className='view-container'>
        <div className='list-container'>
          <h1>Property List</h1>

          <div className='property-form'>
            <input
              type='text'
              name='newPropertyName'
              value={newPropertyName}
              placeholder='Property Name'
              onInput={this.handleInputChange}
            />
            <input
              type='number'
              name='newPropertyPrice'
              value={newPropertyPrice}
              placeholder='Property Price'
              onInput={this.handleInputChange}
            />
            <input
              type='text'
              name='ownerId'
              value={ownerId}
              placeholder='Owner ID'
              onInput={this.handleInputChange}
            />
            <button onClick={this.handleAddProperty}>Add Property</button>
          </div>

          <ul>
            {properties.map((property) => (
              <li key={property.id}>
                <span>
                  {property.name} - ${property.price} (Owner ID:{' '}
                  {property.ownerId})
                </span>
                <button
                  className='remove-btn'
                  onClick={() => this.handleRemoveProperty(property.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default PropertyView;
