import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileLock, ShieldAlert, LogOut, Menu, Bell, DollarSign, PersonStanding } from 'lucide-react';
import CyberBackground from '../ui/CyberBackground'; // Import particles
import { verifyAuthorization, verifyMessage } from 'ethers';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent
      ${isActive ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/50 shadow-[0_0_15px_rgba(0,255,157,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon size={20} />
    <span className="font-medium font-mono text-sm tracking-wide">{label}</span>
  </NavLink>
);

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState("Not Connected");

  useEffect(() => {
    const stored = localStorage.getItem('walletAddress');
    if (stored) {
      setWalletAddress(`${stored.substring(0, 6)}...${stored.substring(stored.length - 4)}`);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-cyber-black text-white overflow-hidden font-sans">
      {/* SIDEBAR */}
        <aside className="w-64 bg-cyber-dark border-r border-cyber-gray flex flex-col z-20 hidden md:flex">
          <div className="p-6 border-b border-cyber-gray">
            <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-cyber-green rounded flex items-center justify-center text-cyber-black font-bold">D</div>
          <h1 className="text-xl font-bold tracking-tighter">DOC<span className="text-cyber-green">SENTINEL</span></h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="OVERVIEW" />
            <SidebarItem to="/upload" icon={UploadCloud} label="SECURE UPLOAD" />
            <SidebarItem to="/files" icon={FileLock} label="MY VAULT" />
            {/* <SidebarItem to="/requests" icon={ShieldAlert} label="ACCESS REQ" /> */}
            <SidebarItem to="/FTSO" icon={DollarSign} label="FTSO PRICE" />
            <SidebarItem to="http://localhost:3001/" icon={PersonStanding} label="COLLAB" />
            <SidebarItem to="/FDCAutoVerify" icon={ShieldAlert} label="FDCAutoVerify" />
          </nav>
          <div className="p-4 border-t border-cyber-gray">
            <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors mb-2"
            >
          <DollarSign size={20} />
          <span className="font-mono text-sm font-bold">PRICING</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="font-mono text-sm font-bold">DISCONNECT</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* 3D Background Layer */}
        <CyberBackground />

        <header className="h-16 bg-cyber-black/80 backdrop-blur-md border-b border-cyber-gray flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-lg font-mono text-gray-400">
            SYSTEM / <span className="text-white font-bold">{location.pathname.replace('/', '').toUpperCase() || 'DASHBOARD'}</span>
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-cyber-green rounded-full shadow-[0_0_8px_var(--color-cyber-green)]"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyber-gray rounded-full border border-cyber-gray hover:border-cyber-green transition-colors cursor-pointer">
              <div className="h-2 w-2 bg-cyber-green rounded-full animate-pulse"></div>
              <span className="font-mono text-xs text-cyber-green">{walletAddress}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;