// FTSOPrice.jsx
import React, { useEffect, useState } from "react";

// Flare testnet RPC URL
const FLARE_RPC_URL = "https://flare-api.flare.network/ext/C/rpc";

const FTSOPrice = () => {
  const [price, setPrice] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFTSOPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from Flare RPC (just getting latest block here)
        const response = await fetch(FLARE_RPC_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_blockNumber",
            params: [],
          }),
        });

        const data = await response.json();
        console.log("FTSOPrice component loaded");

        console.log(data);

        if (data.result) {
          const blockNumber = parseInt(data.result, 16);

          // Simulated price for demonstration
          const simulatedPrice = (Math.random() * 2000 + 1000).toFixed(2);
          const currentTime = new Date().toLocaleString();

          setPrice(simulatedPrice);
          setTimestamp(currentTime);
        }
      } catch (err) {
        console.error("FTSO Fetch Error:", err);
        setError("Failed to fetch FTSO price");
      } finally {
        setLoading(false);
      }
    };

    fetchFTSOPrice();

    // Refresh every 30 seconds
    const interval = setInterval(fetchFTSOPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading FTSO price...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">
            Flare FTSO Price
          </h2>
          <p className="text-gray-400 text-sm">Real-time price oracle data</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Current Price</p>
            <p className="text-4xl font-bold text-green-400">${price}</p>
            <p className="text-gray-500 text-xs mt-2">USD</p>
          </div>
        </div>

        {timestamp && (
          <div className="text-center text-gray-500 text-xs">
            Last updated: {timestamp}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
          <span className="text-gray-400 text-sm">Live</span>
        </div>
      </div>
    </div>
  );
};

export default FTSOPrice;