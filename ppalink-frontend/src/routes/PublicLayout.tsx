import { Outlet } from 'react-router-dom';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';

const PublicLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col main-background">
      <PublicHeader />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <main className="pb-0">
          {children || <Outlet />}
        </main>

        <PublicFooter />
      </div>
    </div>
  );
};

export default PublicLayout;
