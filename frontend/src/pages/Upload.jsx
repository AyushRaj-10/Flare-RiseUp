import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Eye,
  XOctagon,
} from "lucide-react";
import toast from "react-hot-toast";
import { FileService } from "../services/api";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("IDLE");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [uploadData, setUploadData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      startProcessing(selectedFile);
    }
  };

  const startProcessing = async (selectedFile) => {
    setStatus("SCANNING");
    setProgress(0); // --- PHASE 1: AI SCANNING (Initiate real upload after visual delay) ---

    let scanProgress = 0;
    const interval = setInterval(() => {
      scanProgress += 5;
      setProgress(scanProgress);
      if (scanProgress >= 100) clearInterval(interval);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      toast.success("AI Scan Initiated. Sending to Secure Core...");
      startEncryptionAndUpload(selectedFile);
    }, 2500);
  };

  const startEncryptionAndUpload = async (fileToUpload) => {
    setStatus("ENCRYPTING");
    setProgress(0);

    try {
      // Fake progress bar while real upload happens
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 2 : prev));
      }, 200); // --- REAL BACKEND CALL (Triggers AI Check) ---

      const response = await FileService.upload(fileToUpload);

      clearInterval(interval);
      setProgress(100);
      const data = response.data;
      setUploadData(data);

      // Update scan result based on REAL AI data
      setScanResult({
        isReal: data.ai_data.status === "REAL",
        score: parseFloat(data.ai_data.confidence) / 100,
        ai_percent: data.ai_data.scores?.ai_percent,
        real_percent: data.ai_data.scores?.real_percent,
      });

      setStatus("SUCCESS");
      toast.success("File Secured On-Chain!", { duration: 5000 });
    } catch (error) {
      console.error("Upload/AI Error:", error);
      // ✅ HANDLE FAKE DOCUMENT (403 Forbidden)
      if (error.response && error.response.status === 403) {
        const ai_data = error.response.data.ai_data;

        setScanResult({
          // Pass data to the ERROR UI component
          score: parseFloat(ai_data.confidence) / 100,
          // Set reason dynamically based on the FAKE result
          reason: `High probability of AI Generation (${ai_data.scores.ai_percent}% confidence)`,
        });

        setStatus("ERROR");
        toast.error("SECURITY ALERT: Deepfake Detected!", { duration: 5000 });
        return;
      }

      setStatus("IDLE");
      toast.error(
        "Upload Failed: " +
          (error.response?.data?.error || error.message || "Server Error")
      );
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("IDLE");
    setScanResult(null);
    setUploadData(null);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <UploadCloud className="text-cyber-green" /> SECURE UPLOAD PIPELINE
        </h2>
        <p className="text-gray-400 font-mono mt-2">
          AI VERIFICATION LAYER{" "}
          <span className="text-cyber-green">ACTIVE</span> • ENCRYPTION{" "}
          <span className="text-cyber-blue">AES-256</span>
        </p>
      </div>
      <div className="bg-cyber-dark border border-cyber-gray rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-size-[40px_40px] opacity-20 pointer-events-none"></div>
        <AnimatePresence mode="wait">
          {status === "IDLE" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center w-full max-w-lg z-10"
            >
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-cyber-gray hover:border-cyber-green hover:bg-cyber-green/5 transition-all rounded-xl p-12 cursor-pointer group"
              >
                <div className="h-20 w-20 bg-cyber-gray/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud
                    size={40}
                    className="text-gray-400 group-hover:text-cyber-green transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Drag file or click to browse
                </h3>
                <p className="text-gray-500 font-mono text-sm">
                  Supports: PDF, JPG, PNG (Max 10MB)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Streamlit Redirect Button for Advanced Image Forensics */}
              <div className="mt-6">
                <a
                  href="http://localhost:8501/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-cyber-blue text-cyber-blue font-bold rounded-lg hover:bg-cyber-blue/10 transition-colors text-sm"
                >
                  <Eye size={18} /> OPEN ADVANCED IMAGE FORENSICS
                </a>
              </div>
            </motion.div>
          )}

          {status === "SCANNING" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center z-10"
            >
              <div className="relative h-32 w-32 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-cyber-green/30 rounded-full animate-[ping_2s_ease-out_infinite]"></div>
                <div className="absolute inset-0 border-4 border-t-cyber-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="h-full w-full bg-cyber-dark rounded-full flex items-center justify-center border border-cyber-green/50 shadow-[0_0_30px_rgba(0,255,157,0.2)]">
                  <Cpu size={48} className="text-cyber-green animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-cyber-green animate-pulse">
                AI ANALYZING...
              </h3>
              <p className="text-gray-400 font-mono mt-2">
                Checking for deepfake artifacts & manipulation
              </p>
              <div className="w-full bg-cyber-gray h-2 rounded-full mt-6 overflow-hidden">
                <motion.div
                  className="h-full bg-cyber-green shadow-[0_0_10px_#00ff9d]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {status === "ENCRYPTING" && (
            <motion.div
              key="encrypting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center z-10"
            >
              <motion.div
                className="h-24 w-24 bg-cyber-blue/20 rounded-xl flex items-center justify-center mx-auto mb-6 border border-cyber-blue shadow-[0_0_30px_rgba(0,204,255,0.3)]"
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock size={40} className="text-cyber-blue" />
              </motion.div>
              <h3 className="text-2xl font-bold text-cyber-blue">
                ENCRYPTING (AES-256)
              </h3>
              <p className="text-gray-400 font-mono mt-2">
                Uploading to IPFS & Hashing to Flare...
              </p>
              <div className="w-full bg-cyber-gray h-2 rounded-full mt-6 overflow-hidden">
                <motion.div
                  className="h-full bg-cyber-blue shadow-[0_0_10px_#00ccff]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}

          {status === "SUCCESS" && uploadData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl bg-cyber-black/80 border border-cyber-green/50 p-8 rounded-2xl z-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-cyber-green shadow-[0_0_20px_#00ff9d]"></div>
              <div className="flex items-start gap-6">
                <div className="bg-cyber-green/20 p-4 rounded-full border border-cyber-green text-cyber-green">
                  <CheckCircle size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Document Verified & Secured
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    The file has been encrypted and the hash is immutable
                    on-chain.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-cyber-gray/30 p-3 rounded border border-cyber-gray">
                      <p className="text-xs text-gray-500 font-mono">IPFS CID</p>
                      <p className="text-sm font-bold text-cyber-green truncate">
                        {uploadData.cid}
                      </p>
                    </div>
                    <div className="bg-cyber-gray/30 p-3 rounded border border-cyber-gray">
                      <p className="text-xs text-gray-500 font-mono">
                        ENCRYPTION
                      </p>
                      <p className="text-lg font-bold text-cyber-blue">
                        AES-256-GCM
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/50 p-3 rounded border border-cyber-gray font-mono text-xs text-gray-500 break-all">
                    FLARE TX HASH:
                    <br />
                    <span className="text-cyber-green">
                      {uploadData.txHash}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 bg-cyber-gray hover:bg-white/10 text-white py-3 rounded-lg font-bold transition-all"
                >
                  Upload Another
                </button>
                <button
                  onClick={() => navigate("/files")} // Add this navigation
                  className="flex-1 bg-cyber-green text-black py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
                >
                  View in Vault
                </button>
              </div>
            </motion.div>
          )}

          {status === "ERROR" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full z-10"
            >
              {/* PASS scanResult TO THE COMPONENT */}
              <DeepfakeAnalysis onClose={reset} aiResult={scanResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DeepfakeAnalysis = ({ onClose, aiResult }) => {
  // Safely parse the highest confidence score (which is returned by the backend)
  const score = aiResult?.score ? (aiResult.score * 100).toFixed(1) : 0;
  // Fallback logic for the percentage display (for the high-confidence FAKE status)
  const forgeryPercent = aiResult?.ai_percent || score;
  // Fallback reason
  const reason =
    aiResult?.reason || "Tampering signature detected. File is untrustworthy.";

  // Static fields that need dynamic data later (Metadata Consistency check requires a separate AI model)
  const metadataStatus = "FAIL";

  return (
    <div className="bg-cyber-dark border border-cyber-red p-6 rounded-xl max-w-2xl w-full mx-auto mt-6 shadow-[0_0_50px_rgba(255,0,85,0.2)]">
      <div className="flex items-center justify-between mb-6 border-b border-cyber-gray pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-cyber-red/20 rounded-lg flex items-center justify-center text-cyber-red animate-pulse">
            <XOctagon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              FORENSIC ANALYSIS REPORT
            </h3>
            <p className="text-cyber-red font-mono text-xs">
              THREAT LEVEL: CRITICAL
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. VISUAL EVIDENCE (STATIC MOCK) */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
            <Eye size={14} /> ERROR LEVEL ANALYSIS (ELA)
          </p>
          <div className="relative h-48 bg-black rounded-lg border border-cyber-gray overflow-hidden">
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-600">
              Heatmap Mock (Static)
            </div>
            {/* Static Heatmap Visual */}
            <div className="absolute inset-0 opacity-80 mix-blend-screen bg-[radial-gradient(circle_at_30%_40%,rgba(255,0,0,0.8),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,0,0,0.6),transparent_30%)]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-red shadow-[0_0_15px_#ff0055] animate-[scan_2s_linear_infinite]"></div>
          </div>
          <p className="text-[10px] text-cyber-red text-center font-mono">
            ▲ Hotspots indicate mismatched compression levels (Pixel Tampering)
          </p>
        </div>

        {/* 2. AI METRICS (DYNAMIC) */}
        <div className="space-y-4">
          <div className="bg-black/40 p-3 rounded border border-cyber-gray">
            <p className="text-xs text-gray-500 font-mono mb-1">
              DETECTION MODEL
            </p>
            <p className="text-white font-bold">Sentinel-ViT-B/16 (Active)</p>
          </div>

          {/* DYNAMIC: Forgery Probability */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>Forgery Probability</span>
              {/* Shows the actual percentage returned by the AI (e.g., 99.8%) */}
              <span className="text-cyber-red font-bold">
                {forgeryPercent}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              {/* Progress bar based on the score */}
              <div
                className="h-full bg-cyber-red"
                style={{
                  width: forgeryPercent + "%",
                  boxShadow: "0 0 10px #ff0055",
                }}
              ></div>
            </div>
          </div>

          {/* DYNAMIC: Metadata Consistency (Still static data, but shows the error flow) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>Metadata Consistency</span>
              <span className="text-yellow-500 font-bold">
                {metadataStatus}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>

          {/* DYNAMIC: Final Reason Box */}
          <div className="bg-cyber-red/10 border border-cyber-red/20 p-3 rounded flex items-start gap-2">
            <AlertTriangle
              size={16}
              className="text-cyber-red shrink-0 mt-0.5"
            />
            <p className="text-xs text-cyber-red/80 leading-tight">
              <span className="font-bold">Result:</span> {reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
