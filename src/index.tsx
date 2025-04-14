import { render } from 'preact';
import './style.css';
import UserView from './views/userView.js';

export function App() {
  return (
    <div>
      <main>
        <UserView />
      </main>
    </div>
  );
}

render(<App />, document.getElementById('app'));
