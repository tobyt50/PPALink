import { Outlet } from 'react-router-dom';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col main-background">
      <PublicHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;