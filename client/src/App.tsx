import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ToastContainer from './components/ui/ToastContainer';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import AppRoutes from './routes/AppRoutes';
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  const { fetchProfile, isInitialized } = useAuthStore();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // Just call fetchProfile. Interceptor will handle the refresh if accessToken is missing but refreshToken cookie exists.
      try {
        await fetchProfile();
      } catch (err) {
        console.error('Initialization failed');
      }
    };

    initApp();

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [fetchProfile]);


  if (!isInitialized || !minTimeElapsed) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <ToastContainer />
      <AppRoutes />
    </Router>
  );
}

export default App;
