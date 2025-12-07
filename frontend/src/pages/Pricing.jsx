import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, Zap, Shield, Globe, 
  Cpu, Server, ArrowRight, Activity 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const tiers = [
    {
      name: "Developer API",
      price: "$0.20",
      period: "per verify",
      description: "Pay-as-you-go API access for startups and fintechs integrating verification.",
      icon: <Cpu size={32} className="text-cyber-blue" />,
      features: [
        "Upload & Verify API Access",
        "Amrit Forensic Shield (Images)",
        "Basic RAG Chat (50 queries/mo)",
        "Immutable Ledger Hashing",
        "Community Support",
      ],
      cta: "Get API Key",
      popular: false,
      color: "border-cyber-blue",
      btnColor: "bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue hover:text-black",
    },
    {
      name: "Compliance Seat",
      price: "$49",
      period: "per user / mo",
      description: "Complete dashboard access for HR, Legal, and Operations teams.",
      icon: <Shield size={32} className="text-cyber-green" />,
      features: [
        "Everything in Developer",
        "300 Document Verifications/mo",
        "Unlimited AI RAG Chat",
        "Live Security Audit Logs",
        "Verified Shareable Links",
        "Priority Email Support",
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "border-cyber-green",
      btnColor: "bg-cyber-green text-black hover:shadow-[0_0_20px_#00ff9d]",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "annual license",
      description: "Dedicated instances and custom AI model tuning for high-volume banks.",
      icon: <Server size={32} className="text-purple-500" />,
      features: [
        "Unlimited Volume License",
        "Private Cloud Deployment (AWS/Azure)",
        "Custom AI Model Training (Tax Forms)",
        "SLA & 24/7 Dedicated Support",
        "White-label Trust Badges",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "border-purple-500",
      btnColor: "bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-cyber-green font-mono text-sm tracking-widest uppercase">
            Transparent Pricing
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold">
            Secure Your Documents.<br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-green">
              Pay for Truth.
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're an API-first startup or a global bank, we have a model that fits your security infrastructure.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-cyber-green/5 blur-[100px] pointer-events-none"></div>

          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-cyber-dark border ${tier.color} ${tier.popular ? 'border-2 shadow-[0_0_30px_rgba(0,255,157,0.15)]' : 'border-opacity-30'} rounded-2xl p-8 flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyber-green text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="mb-4">{tier.icon}</div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-gray-400 text-sm mt-2 h-10">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-500 text-sm ml-2">{tier.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-cyber-green mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/signup")} // Redirect to signup/contact
                className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${tier.btnColor}`}
              >
                {tier.cta} <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* TRUST BADGE / SOCIAL PROOF */}
        <div className="mt-20 pt-10 border-t border-cyber-gray text-center">
          <p className="text-gray-500 font-mono text-sm mb-6">TRUSTED BY SECURITY TEAMS AT</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            {['FinTech Corp', 'Global Bank', 'SecureLaw', 'ChainData'].map(brand => (
                <span key={brand} className="text-xl font-bold text-gray-400 flex items-center gap-2">
                    <Activity size={20} /> {brand}
                </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;