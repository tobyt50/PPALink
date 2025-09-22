import { Outlet } from 'react-router-dom';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';

const PublicLayout = () => {
  return (
    <div className="h-screen flex flex-col main-background">
      <PublicHeader />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <main className="pb-4">
          <Outlet />
        </main>

        <PublicFooter />
      </div>
    </div>
  );
};

export default PublicLayout;
