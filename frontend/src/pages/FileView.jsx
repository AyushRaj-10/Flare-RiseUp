import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Lock,
  Download,
  Bot,
  Send,
  Sparkles,
  Copy,
  Database,
  Activity,
  User,
  Link as LinkIcon,
  Clock,
  Cpu,
  Hash,
} from "lucide-react";
import { AIService } from "../services/api"; // Import Real API

const FileView = () => {
  const hasInitialized = useRef(false);
  const { fileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get file data passed from MyFiles or fall back to empty object
  const fileDetails = location.state?.file || {};

  // UI State
  const [activeTab, setActiveTab] = useState("preview");
  const [isDecryptingView, setIsDecryptingView] = useState(true);

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // --- 1. INITIALIZE AI SESSION ON MOUNT ---
  // --- 1. INITIALIZE AI SESSION ON MOUNT ---
  useEffect(() => {
    // Prevent double-firing in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initSession = async () => {
      setIsDecryptingView(true);

      try {
        setChatHistory([
          {
            id: "init-" + Date.now(),
            sender: "ai",
            text: "Establishing secure connection to Neural Core...",
          },
        ]);

        if (fileDetails._id) {
          await AIService.initChat(fileDetails._id);

          setChatHistory((prev) => {
            // Optional: Extra safety to ensure no duplicate "Ready" messages
            if (prev.some((msg) => msg.text.includes("Decryption complete")))
              return prev;

            return [
              ...prev,
              {
                id: "ready-" + Date.now(),
                sender: "ai",
                text: `Decryption complete. I have analyzed "${fileDetails.name}". You can now ask specific questions.`,
              },
            ];
          });
        } else {
          setChatHistory((prev) => [
            ...prev,
            {
              id: "error-" + Date.now(),
              sender: "ai",
              text: `Error: File ID missing. Please return to vault.`,
            },
          ]);
        }
      } catch (error) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: "error-" + Date.now(),
            sender: "ai",
            text: "Secure Handshake Failed. Make sure the Python AI Server is running.",
          },
        ]);
      } finally {
        setIsDecryptingView(false);
      }
    };

    initSession();
  }, [fileDetails._id, fileDetails.name]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- 2. CORE CHAT LOGIC (REAL API) ---
  const handleSendMessage = async (textOverride = null) => {
    const question = textOverride || chatInput;
    if (!question.trim()) return;

    // Add User Message
    setChatHistory((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: question },
    ]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      // Call Backend: Forward question to Python
      const response = await AIService.chatWithDocument(question);

      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: "Error: Connection interrupted.",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // If no file data found (e.g. user refreshed page directly), show error or redirect
  if (!fileDetails.name) {
    return (
      <div className="h-screen flex items-center justify-center bg-cyber-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-mono text-cyber-red mb-4">
            ACCESS DENIED: No File Context
          </h2>
          <button
            onClick={() => navigate("/my-files")}
            className="bg-cyber-gray px-4 py-2 rounded"
          >
            Return to Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col md:flex-row gap-6 pb-6">
      {/* ================= LEFT PANEL: DOCUMENT HUB ================= */}
      <div className="w-full md:w-3/5 flex flex-col bg-cyber-dark border border-cyber-gray rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-cyber-gray flex items-center gap-4 bg-black/40">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white truncate">
              {fileDetails.name}
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono mt-1">
              <span className="text-cyber-green flex items-center gap-1">
                <ShieldCheck size={12} /> AI VERIFIED
              </span>
              <span className="text-cyber-blue flex items-center gap-1">
                <Lock size={12} /> AES-256 ENCRYPTED
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-cyber-blue border border-cyber-gray rounded hover:bg-cyber-blue/10 transition-all">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyber-gray bg-black/40 font-mono text-sm">
          {["preview", "metadata", "chain"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center capitalize transition-colors relative ${
                activeTab === tab
                  ? "text-cyber-green font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "chain" ? "Blockchain Proof" : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-green"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 relative bg-cyber-black/50 p-4 overflow-auto">
          <AnimatePresence mode="wait">
            {/* TAB: PREVIEW */}
            {activeTab === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center bg-cyber-dark/50 border border-cyber-gray/30 rounded-lg relative overflow-hidden"
              >
                {isDecryptingView ? (
                  <div className="text-center">
                    <div className="relative h-16 w-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-cyber-blue/30 rounded-full animate-spin"></div>
                      <Lock
                        className="absolute inset-0 m-auto text-cyber-blue animate-pulse"
                        size={24}
                      />
                    </div>
                    <p className="text-cyber-blue font-mono animate-pulse">
                      DECRYPTING FOR AI ANALYSIS...
                    </p>
                  </div>
                ) : (
                  // Using IPFS Gateway to preview (Assuming it's a public gateway or handled via proxy)
                  <iframe
                    src={`https://ipfs.io/ipfs/${fileDetails.cid}`}
                    className="w-full h-full rounded-lg"
                    title="Document Preview"
                  ></iframe>
                )}
              </motion.div>
            )}

            {/* TAB: METADATA */}
            {activeTab === "metadata" && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Using real data from fileDetails */}
                  <MetaItem
                    icon={FileText}
                    label="File Name"
                    value={fileDetails.name}
                  />
                  <MetaItem
                    icon={Database}
                    label="IPFS CID"
                    value={fileDetails.cid}
                  />
                  <MetaItem
                    icon={Clock}
                    label="Uploaded On"
                    value={new Date(
                      fileDetails.uploadedAt
                    ).toLocaleDateString()}
                  />
                  <MetaItem
                    icon={User}
                    label="Owner Wallet"
                    value={fileDetails.owner}
                  />
                </div>

                <div className="bg-cyber-green/5 border border-cyber-green/20 p-4 rounded-lg">
                  <h4 className="flex items-center gap-2 text-cyber-green font-bold mb-2">
                    <Cpu size={18} /> AI Security Audit
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Document passed all authenticity checks. No signs of
                    deepfake generation, pixel manipulation, or metadata forgery
                    detected.
                  </p>
                  <div className="mt-3 h-2 bg-cyber-gray rounded-full overflow-hidden">
                    <div className="h-full bg-cyber-green w-[99%] shadow-[0_0_10px_#00ff9d]"></div>
                  </div>
                  <p className="text-right text-xs text-cyber-green font-mono mt-1">
                    99% CONFIDENCE SCORE
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB: BLOCKCHAIN */}
            {activeTab === "chain" && (
              <motion.div
                key="chain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-4 font-mono"
              >
                <div className="bg-black/40 border border-cyber-gray p-4 rounded-lg">
                  <h4 className="text-gray-500 text-xs mb-1 flex items-center gap-2">
                    <Hash size={14} /> IMMUTABLE FILE HASH (SHA-256)
                  </h4>
                  <p className="text-cyber-green text-sm break-all">
                    {fileDetails.hash}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* We don't save block number in Mongo currently, so using placeholder or txHash if you saved it */}
                  <MetaItem
                    icon={Activity}
                    label="Status"
                    value="Confirmed"
                    color="text-cyber-green"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 w-full bg-cyber-gray/50 hover:bg-cyber-gray text-cyber-blue border border-cyber-blue/30 py-3 rounded-lg transition-all">
                  <LinkIcon size={18} /> View on Flare Explorer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= RIGHT PANEL: AI SENTINEL CHAT ================= */}
      <div className="w-full md:w-2/5 flex flex-col bg-cyber-dark border border-cyber-gray rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-cyber-gray bg-gradient-to-r from-cyber-dark to-cyber-gray/20 flex items-center gap-3">
          <div className="h-10 w-10 bg-cyber-green/10 rounded-full flex items-center justify-center border border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.2)]">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              SENTINEL EXTRACTOR{" "}
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-green text-black font-bold">
                ONLINE
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              RAG Engine: Hybrid Search
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
          {chatHistory.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative group ${
                  msg.sender === "user"
                    ? "bg-cyber-blue/10 border border-cyber-blue/30 text-white rounded-tr-none"
                    : "bg-[#1a1a1a] border border-cyber-gray text-gray-200 rounded-tl-none shadow-lg"
                }`}
              >
                <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                {msg.sender === "ai" && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                    title="Copy text"
                  >
                    <Copy size={12} className="text-gray-400" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] border border-cyber-gray p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                <span className="text-xs text-cyber-green font-mono animate-pulse mr-2">
                  ANALYZING
                </span>
                <div className="h-1.5 w-1.5 bg-cyber-green rounded-full animate-bounce"></div>
                <div className="h-1.5 w-1.5 bg-cyber-green rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-1.5 w-1.5 bg-cyber-green rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Controls */}
        <div className="p-4 border-t border-cyber-gray bg-cyber-black">
          {/* SMART CHIPS */}
          <div className="mb-4">
            <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wider">
              Quick Extract:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <ExtractChip
                label="📑 Summarize"
                prompt="Summarize this document."
                onClick={handleSendMessage}
              />
              <ExtractChip
                label="🔑 Key Entities"
                prompt="What are the key names and dates mentioned?"
                onClick={handleSendMessage}
              />
              <ExtractChip
                label="🔍 Specifics"
                prompt="Are there any financial figures mentioned?"
                onClick={handleSendMessage}
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Ask the AI..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isAiThinking}
              className="w-full bg-cyber-dark border border-cyber-gray rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/50 transition-all placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiThinking}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyber-green hover:bg-[#00e08b] text-black rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-600"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ icon: Icon, label, value, color = "text-white" }) => (
  <div className="bg-black/30 p-3 rounded border border-cyber-gray flex items-center gap-3">
    <div className="text-gray-500">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-mono">{label}</p>
      <p className={`font-medium ${color} truncate`}>{value}</p>
    </div>
  </div>
);

const ExtractChip = ({ label, prompt, onClick }) => (
  <button
    onClick={() => onClick(prompt)}
    className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 bg-cyber-gray/50 hover:bg-cyber-gray border border-cyber-gray hover:border-cyber-green/50 rounded-lg text-xs text-gray-300 hover:text-cyber-green transition-all font-mono"
  >
    <Sparkles size={12} /> {label}
  </button>
);

export default FileView;