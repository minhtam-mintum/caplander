import { Outlet } from 'react-router-dom';
import { AppHeader } from 'app/components/organisms/AppHeader';

function App() {
  return (
    <div className='min-h-screen bg-background'>
      <AppHeader />
      <Outlet />
    </div>
  );
}

export default App;
