import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAppStore } from '../../store/appStore';

export default function MainLayout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
