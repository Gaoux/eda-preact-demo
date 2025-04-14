import { render } from 'preact';
import './style.css';
import UserView from './views/userView.js';
import PropertyView from './views/propertyView';

export function App() {
  return (
    <div>
      <main>
        <div class='main'>
          <UserView />
          <PropertyView />
        </div>
      </main>
    </div>
  );
}

render(<App />, document.getElementById('app'));
