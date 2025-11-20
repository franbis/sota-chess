import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.js';

import './style/index.sass';



let app = <App />;
if (__STRICT_MODE__)
	app = (
		<StrictMode>
		{app}
		</StrictMode>
	);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(app);