import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, FileText, Database, 
  Activity, ArrowUpRight, HardDrive, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileService } from '../services/api'; // Ensure this path matches your structure

const Dashboard = () => {
  const navigate = useNavigate();
  const walletAddress = localStorage.getItem('walletAddress') || "0x23b3b203c3eaa85518e2c168c52b6fa84dc555fb";
  
  // State for Dynamic Data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    filesSecured: 0,
    threatsBlocked: 0,
    storageUsed: "0MB",
    auditLog: []
  });

  // FETCH REAL STATS ON MOUNT
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats from the backend endpoint created earlier
        const response = await FileService.getStats();
        
        // If the backend returns valid data, update state
        if (response.data) {
          setStats({
            filesSecured: response.data.filesSecured || 0,
            threatsBlocked: response.data.threatsBlocked || 0,
            storageUsed: response.data.storageUsed || "0MB",
            auditLog: response.data.auditLog || []
          });
        }
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
        // Optional: Keep default '0' values on error or show a toast
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Helper for Audit Log Time
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statCards = [
    { 
      title: 'Files Secured', 
      value: loading ? '...' : stats.filesSecured.toString(), 
      icon: FileText, 
      color: 'text-blue-400', 
      border: 'border-blue-400/30', 
      bg: 'bg-blue-400/10' 
    },
    { 
      title: 'AI Verifications', 
      value: '99.9%', // Static for now, or calculate based on (total - threats) / total
      icon: ShieldCheck, 
      color: 'text-cyber-green', 
      border: 'border-cyber-green/30', 
      bg: 'bg-cyber-green/10' 
    },
    { 
      title: 'Threats Blocked', 
      value: 2 , 
      icon: ShieldAlert, 
      color: 'text-cyber-red', 
      border: 'border-cyber-red/30', 
      bg: 'bg-cyber-red/10' 
    },
    { 
      title: 'Storage Used', 
      value: stats.storageUsed, 
      icon: Database, 
      color: 'text-purple-400', 
      border: 'border-purple-400/30', 
      bg: 'bg-purple-400/10' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 min-h-screen text-white">
      
      {/* 1. Welcome & Network Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-gray pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SYSTEM OVERVIEW</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">
            Welcome back, Sentinel Node <span className="text-cyber-green font-bold">{walletAddress.substring(0, 10)}...</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-cyber-dark border border-cyber-green/30 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(0,255,157,0.1)]">
           <div className="relative">
             <div className="h-3 w-3 bg-cyber-green rounded-full animate-ping absolute opacity-75"></div>
             <div className="h-3 w-3 bg-cyber-green rounded-full relative"></div>
           </div>
           <div className="text-xs font-mono">
             <p className="text-white font-bold">SYSTEM ONLINE</p>
             <p className="text-cyber-green/70">Latency: 24ms</p>
           </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-xl border ${stat.border} ${stat.bg} relative overflow-hidden backdrop-blur-sm`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-black/40 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <Activity size={16} className={`${stat.color} opacity-50`} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
              {stat.value}
              {loading && index !== 1 && <Loader2 size={16} className="animate-spin text-gray-500" />}
            </h3>
            <p className={`text-xs font-mono font-bold ${stat.color}`}>{stat.title.toUpperCase()}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Live Activity Log */}
        <div className="lg:col-span-2 bg-cyber-dark border border-cyber-gray rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-green to-transparent opacity-20"></div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyber-green" /> LIVE SECURITY AUDIT LOG
          </h3>
          
          <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10 text-gray-500 animate-pulse font-mono">
                    Initializing Log Stream...
                </div>
            ) : stats.auditLog.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-mono">
                    System initialized. No events recorded yet.
                </div>
            ) : (
                stats.auditLog.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-cyber-gray/50 last:border-0 group">
                    <div className="font-mono text-xs text-gray-500 mt-1">{formatTime(item.timestamp)}</div>
                    <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          item.status === 'CRITICAL' ? 'text-cyber-red' : 
                          item.status === 'INFO' ? 'text-cyber-blue' : 'text-cyber-green'
                        }`}>
                          {item.eventType}
                        </p>
                        <p className="text-xs text-gray-400 font-mono group-hover:text-white transition-colors">{item.description}</p>
                    </div>
                    {item.status === 'CRITICAL' ? <ShieldAlert size={16} className="text-cyber-red" /> : <ShieldCheck size={16} className="text-gray-600 group-hover:text-cyber-green" />}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Storage */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-cyber-dark border border-cyber-gray rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">QUICK ACTIONS</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/upload')} // Points to Upload Page
                className="p-4 bg-cyber-green/5 border border-cyber-green/20 rounded-lg hover:bg-cyber-green/10 hover:border-cyber-green/50 transition-all text-center group"
              >
                <div className="h-10 w-10 mx-auto bg-cyber-green/20 text-cyber-green rounded-full flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-cyber-green group-hover:text-black transition-all">
                  <ArrowUpRight size={20} />
                </div>
                <p className="text-xs font-bold text-cyber-green font-mono">UPLOAD FILE</p>
              </button>

              <button 
                 onClick={() => navigate('/files')} // Points to Vault Page
                 className="p-4 bg-cyber-blue/5 border border-cyber-blue/20 rounded-lg hover:bg-cyber-blue/10 hover:border-cyber-blue/50 transition-all text-center group"
              >
                <div className="h-10 w-10 mx-auto bg-cyber-blue/20 text-cyber-blue rounded-full flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-cyber-blue group-hover:text-black transition-all">
                  <Database size={20} />
                </div>
                <p className="text-xs font-bold text-cyber-blue font-mono">VIEW VAULT</p>
              </button>
            </div>
          </div>

          {/* Storage Health */}
          <div className="bg-cyber-dark border border-cyber-gray rounded-xl p-6 relative overflow-hidden">
             <div className="flex justify-between items-center mb-4 relative z-10">
               <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                 <HardDrive size={16} /> LOCAL STORAGE
               </h3>
               <span className="text-xs font-mono text-cyber-green">45% FREE</span>
             </div>
             
             {/* Visual Bar */}
             <div className="w-full bg-black h-3 rounded-full overflow-hidden mb-2 relative z-10 border border-gray-800">
               <div className="h-full w-[55%] bg-gradient-to-r from-cyber-blue to-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.5)]"></div>
             </div>
             <p className="text-xs text-gray-500 font-mono relative z-10">{stats.storageUsed} / 1GB Encrypted Allocated</p>

             {/* Background Decoration */}
             <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-cyber-green/10 rounded-full blur-xl animate-pulse"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;