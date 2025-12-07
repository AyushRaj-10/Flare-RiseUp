import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, Share2, ShieldCheck, 
  Clock, Database, Search, Loader2, MessageSquare, ExternalLink,
  Trash2 // ✅ Import Trash Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast";
import { FileService } from "../services/api";

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await FileService.getMyFiles();
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to decrypt file vault");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE HANDLER
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop click from triggering "View File"
    
    if (!window.confirm("Are you sure you want to delete this file? This cannot be undone.")) {
      return;
    }

    const toastId = toast.loading("Deleting file...");

    try {
      await FileService.deleteFile(id);
      
      // Update UI immediately (Remove deleted file from state)
      setFiles(prev => prev.filter(f => f._id !== id));
      
      toast.success("File deleted successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file", { id: toastId });
    }
  };

  const handleViewFile = (file) => {
    navigate(`/files/${file._id}`, { state: { file } });
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 min-h-screen text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-cyber-gray pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Database className="text-cyber-green" /> 
            SECURE VAULT
          </h1>
          <p className="text-gray-400 font-mono mt-1 text-sm">
            ENCRYPTED STORAGE • IMMUTABLE LEDGER
          </p>
        </div>
        
        {/* SEARCH BAR */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search hash or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cyber-black border border-cyber-gray rounded-full py-2 pl-10 pr-4 text-sm focus:border-cyber-green focus:outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-cyber-green">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-mono text-sm">DECRYPTING METADATA...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-cyber-gray rounded-xl">
          <div className="bg-cyber-gray/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-300">No Files Found</h3>
          <p className="text-gray-500 mt-2">Upload a document to secure it on the blockchain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <motion.div 
              key={file._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-cyber-dark border border-cyber-gray hover:border-cyber-green/50 rounded-xl p-5 transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.1)] relative overflow-hidden"
            >
              {/* ✅ DELETE BUTTON (Top Right Corner) */}
              <button 
                onClick={(e) => handleDelete(e, file._id)}
                className="absolute top-0 right-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-bl-xl border-b border-l border-red-500/20 transition-all z-20"
                title="Delete File"
              >
                <Trash2 size={16} />
              </button>

              {/* Decorative "Verified" Banner (Moved slightly left to avoid overlap) */}
              <div className="absolute top-0 right-10 bg-cyber-green/10 text-cyber-green text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-cyber-green/20 flex items-center gap-1">
                <ShieldCheck size={10} /> VERIFIED
              </div>

              {/* Icon & Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-gray-800 to-black p-3 rounded-lg border border-gray-700 group-hover:border-cyber-green/30 transition-colors">
                  <FileText className="text-cyber-blue" size={24} />
                </div>
                <div className="overflow-hidden pr-8"> {/* Added padding-right to avoid text overlapping buttons */}
                  <h3 className="font-bold text-white truncate w-full" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-1">
                    <Clock size={10} /> 
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Hashes / IDs */}
              <div className="space-y-2 mb-6">
                <div className="bg-black/40 p-2 rounded border border-cyber-gray/50 flex justify-between items-center group-hover:border-cyber-green/20 transition-colors">
                  <span className="text-[10px] text-gray-500 font-mono">CID</span>
                  <span className="text-xs font-mono text-cyber-blue truncate w-32 text-right">
                    {file.cid ? (
                      <a href={`https://ipfs.io/ipfs/${file.cid}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1 hover:text-white hover:underline">
                        {`${file.cid.substring(0, 10)}...`} <ExternalLink size={10} />
                      </a>
                    ) : <span className="text-gray-600">Pending...</span>}
                  </span>
                </div>
                <div className="bg-black/40 p-2 rounded border border-cyber-gray/50 flex justify-between items-center group-hover:border-cyber-green/20 transition-colors">
                  <span className="text-[10px] text-gray-500 font-mono">TX</span>
                  <span className="text-xs font-mono text-cyber-green truncate w-32 text-right">
                    {file.txHash ? (
                      <a href={`https://coston2-explorer.flare.network/tx/${file.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1 hover:text-white hover:underline">
                        {`${file.txHash.substring(0, 10)}...`} <ExternalLink size={10} />
                      </a>
                    ) : <span className="text-gray-600">Unverified</span>}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open(`https://ipfs.io/ipfs/${file.cid}`, '_blank')}
                  className="flex-1 bg-cyber-gray/50 hover:bg-cyber-blue hover:text-black text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download
                </button>
                
                <button 
                  onClick={() => handleViewFile(file)}
                  className="flex-1 bg-cyber-green/10 border border-cyber-green/30 hover:bg-cyber-green hover:text-black text-cyber-green py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Chat & View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFiles;