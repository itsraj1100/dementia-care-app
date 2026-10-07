import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testFirestoreConnection } from './services/firebase/firebaseClient.ts';

// Validate Firestore connection on boot
testFirestoreConnection().catch(() => {});

createRoot(document.getElementById('root')!).render(<App />);
