import { Outlet, useNavigation } from 'react-router-dom';
import { LoadingPage } from 'app/components/organisms/LoadingPage';

export function RouteLayout() {
  const navigation = useNavigation();
  return navigation.state === 'loading' ? <LoadingPage /> : <Outlet />;
}
