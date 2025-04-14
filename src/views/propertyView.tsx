import { h, Component } from 'preact';
import propertyStore from '../stores/propertyStore';
import { addProperty, removeProperty } from '../actions/propertyActions';

interface Property {
  id: string;
  name: string;
  price: number;
}

class PropertyView extends Component<{}, { properties: Property[] }> {
  constructor() {
    super();
    this.state = { properties: [] };
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

  render() {
    return (
      <div>
        <h1>Property List</h1>
        <ul>
          {this.state.properties.map((property) => (
            <li key={property.id}>
              {property.name} - ${property.price}
            </li>
          ))}
        </ul>
        <button
          onClick={() => addProperty({ id: '1', name: 'Villa', price: 500 })}
        >
          Add Property
        </button>
        <button onClick={() => removeProperty('1')}>Remove Property</button>
      </div>
    );
  }
}

export default PropertyView;
