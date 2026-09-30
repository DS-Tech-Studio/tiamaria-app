import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </NotificationProvider>
  );
}