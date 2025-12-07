import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Search, Database, Activity } from 'lucide-react';

const FDCCompleteTester = () => {
  const [activeSection, setActiveSection] = useState('fdc');
  const [activeEndpoint, setActiveEndpoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // FDC states
  const [fdcNetwork, setFdcNetwork] = useState('coston2');
  const [fdcRoundId, setFdcRoundId] = useState('');
  const [fdcRequestBytes, setFdcRequestBytes] = useState('');
  const [fdcRequestBytesRaw, setFdcRequestBytesRaw] = useState('');

  // FSP states
  const [fspNetwork, setFspNetwork] = useState('coston2');

  const NETWORKS = {
    coston2: 'https://ctn2-data-availability.flare.network',
    flare: 'https://flr-data-availability.flare.network',
    songbird: 'https://sgb-data-availability.flare.network',
  };

  const FDC_ENDPOINTS = [
    {
      id: 'fdc-get',
      method: 'GET',
      path: '/api/v1/fdc',
      name: 'Get FDC Info',
      description: 'Get FDC protocol information',
      supportsRoundId: true,
    },
    {
      id: 'fdc-proof-by-request-round',
      method: 'POST',
      path: '/api/v1/fdc/proof-by-request-round',
      name: 'Get Proof by Request Round',
      description: 'Get proof for a specific request and round',
      needsRound: true,
      needsBytes: 'requestBytes',
    },
    {
      id: 'fdc-proof-by-request-round-raw',
      method: 'POST',
      path: '/api/v1/fdc/proof-by-request-round-raw',
      name: 'Get Raw Proof by Request Round',
      description: 'Get raw proof data for a specific request and round',
      needsRound: true,
      needsBytes: 'requestBytesRaw',
    },
    {
      id: 'fdc-raw',
      method: 'GET',
      path: '/api/v1/fdc/raw',
      name: 'Get Raw FDC Data',
      description: 'Get raw FDC protocol data',
      supportsRoundId: true,
    },
  ];

  const FSP_ENDPOINTS = [
    {
      id: 'fsp-latest-voting-round',
      method: 'GET',
      path: '/api/v0/fsp/latest-voting-round',
      name: 'Get Latest Voting Round',
      description: 'Get the latest voting round information',
    },
    {
      id: 'fsp-status',
      method: 'GET',
      path: '/api/v0/fsp/status',
      name: 'Get FSP Status',
      description: 'Get Fast State Protocol status',
    },
  ];

  const executeFDCRequest = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveEndpoint(endpoint.id);

    try {
      const baseUrl = NETWORKS[fdcNetwork];
      let response;
      let fullUrl = `${baseUrl}${endpoint.path}`;

      if (endpoint.method === 'GET') {
        if (endpoint.supportsRoundId && fdcRoundId && fdcRoundId.trim()) {
          const roundId = parseInt(fdcRoundId.trim(), 10);
          if (!isNaN(roundId)) {
            const separator = fullUrl.includes('?') ? '&' : '?';
            fullUrl += `${separator}voting_round_id=${roundId}`;
          }
        }

        console.log('GET Request URL:', fullUrl);

        response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });
      } else if (endpoint.method === 'POST') {
        if (!fdcRoundId || !fdcRoundId.trim()) {
          throw new Error('Voting Round ID is required for POST requests');
        }

        let requestBytes = '';
        if (endpoint.needsBytes === 'requestBytes') {
          requestBytes = fdcRequestBytes;
        } else if (endpoint.needsBytes === 'requestBytesRaw') {
          requestBytes = fdcRequestBytesRaw;
        }

        if (!requestBytes || !requestBytes.trim()) {
          throw new Error('Request Bytes are required for POST requests');
        }

        const votingRoundId = parseInt(fdcRoundId.trim(), 10);
        if (isNaN(votingRoundId)) {
          throw new Error('Voting Round ID must be a valid number');
        }

        const body = {
          voting_round_id: votingRoundId,
          requestBytes: requestBytes.trim(),
        };

        console.log('POST Request URL:', fullUrl);
        console.log('POST Request Body:', body);

        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
      } else {
        throw new Error(`Unsupported method: ${endpoint.method}`);
      }

      const responseText = await response.text();
      console.log('Response Status:', response.status);
      console.log('Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { raw_response: responseText };
      }

      if (!response.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }

      setResult({
        endpoint: fullUrl,
        method: endpoint.method,
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err) {
      console.error('FDC Request Error:', err);
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const executeFSPRequest = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveEndpoint(endpoint.id);

    try {
      const baseUrl = NETWORKS[fspNetwork];
      const fullUrl = `${baseUrl}${endpoint.path}`;

      console.log('FSP Request URL:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { raw_response: responseText };
      }

      if (!response.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }

      setResult({
        endpoint: fullUrl,
        method: endpoint.method,
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err) {
      console.error('FSP Request Error:', err);
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testAllFDCEndpoints = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveEndpoint('all-fdc');

    const results = [];
    const baseUrl = NETWORKS[fdcNetwork];

    for (const endpoint of FDC_ENDPOINTS) {
      try {
        if (endpoint.method === 'GET') {
          let fullUrl = `${baseUrl}${endpoint.path}`;

          if (endpoint.supportsRoundId && fdcRoundId && fdcRoundId.trim()) {
            const roundId = parseInt(fdcRoundId.trim(), 10);
            if (!isNaN(roundId)) {
              const separator = fullUrl.includes('?') ? '&' : '?';
              fullUrl += `${separator}voting_round_id=${roundId}`;
            }
          }

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });

          const responseText = await response.text();
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            data = { raw_response: responseText };
          }

          results.push({
            name: endpoint.name,
            endpoint: fullUrl,
            method: endpoint.method,
            status: response.ok ? 'Success' : 'Failed',
            statusCode: response.status,
            data,
          });
        } else {
          results.push({
            name: endpoint.name,
            endpoint: `${baseUrl}${endpoint.path}`,
            method: endpoint.method,
            status: 'Skipped',
            message: 'POST endpoints require specific parameters',
          });
        }
      } catch (err) {
        results.push({
          name: endpoint.name,
          endpoint: `${baseUrl}${endpoint.path}`,
          method: endpoint.method,
          status: 'Error',
          error: err?.message || 'Unknown error',
        });
      }
    }

    setResult({ type: 'batch', category: 'FDC', results });
    setLoading(false);
  };

  const testAllFSPEndpoints = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveEndpoint('all-fsp');

    const results = [];
    const baseUrl = NETWORKS[fspNetwork];

    for (const endpoint of FSP_ENDPOINTS) {
      try {
        const fullUrl = `${baseUrl}${endpoint.path}`;
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { raw_response: responseText };
        }

        results.push({
          name: endpoint.name,
          endpoint: fullUrl,
          method: endpoint.method,
          status: response.ok ? 'Success' : 'Failed',
          statusCode: response.status,
          data,
        });
      } catch (err) {
        results.push({
          name: endpoint.name,
          endpoint: `${baseUrl}${endpoint.path}`,
          method: endpoint.method,
          status: 'Error',
          error: err?.message || 'Unknown error',
        });
      }
    }

    setResult({ type: 'batch', category: 'FSP', results });
    setLoading(false);
  };

  const renderFDCSection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Network
        </label>
        <select
          value={fdcNetwork}
          onChange={(e) => setFdcNetwork(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="coston2">Coston2 (Testnet)</option>
          <option value="flare">Flare (Mainnet)</option>
          <option value="songbird">Songbird</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border-2 border-blue-500">
        <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voting Round ID
              <span className="text-blue-400 ml-2">
                (Used in URL for GET, Body for POST)
              </span>
            </label>
            <input
              type="number"
              value={fdcRoundId}
              onChange={(e) => setFdcRoundId(e.target.value)}
              placeholder="e.g., 1028678"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs text-blue-300">
              <p>• GET requests: Added as ?voting_round_id={'{'}value{'}'}</p>
              <p>• POST requests: Sent in request body as voting_round_id</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request Bytes (for proof-by-request-round){' '}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              value={fdcRequestBytes}
              onChange={(e) => setFdcRequestBytes(e.target.value)}
              placeholder="0x4164647265737356616c6964697479..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request Bytes (for proof-by-request-round-raw){' '}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              value={fdcRequestBytesRaw}
              onChange={(e) => setFdcRequestBytesRaw(e.target.value)}
              placeholder="0x4164647265737356616c6964697479..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FDC_ENDPOINTS.map((endpoint) => (
          <div
            key={endpoint.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium">{endpoint.name}</h4>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  endpoint.method === 'GET'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {endpoint.method}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {endpoint.description}
            </p>
            <code className="text-xs text-gray-500 block mb-3">
              {endpoint.path}
            </code>
            {endpoint.supportsRoundId && (
              <p className="text-xs text-blue-400 mb-2">
                💡 Optional: Add Round ID in URL query parameter
              </p>
            )}
            {endpoint.needsRound && (
              <p className="text-xs text-yellow-400 mb-2">
                ⚠ Required: Round ID and Request Bytes
              </p>
            )}
            <button
              onClick={() => executeFDCRequest(endpoint)}
              disabled={loading && activeEndpoint === endpoint.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
            >
              {loading && activeEndpoint === endpoint.id ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Test Endpoint
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={testAllFDCEndpoints}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
      >
        {loading && activeEndpoint === 'all-fdc' ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
        Test All FDC GET Endpoints
      </button>
    </div>
  );

  const renderFSPSection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Network
        </label>
        <select
          value={fspNetwork}
          onChange={(e) => setFspNetwork(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="coston2">Coston2 (Testnet)</option>
          <option value="flare">Flare (Mainnet)</option>
          <option value="songbird">Songbird</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FSP_ENDPOINTS.map((endpoint) => (
          <div
            key={endpoint.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium">{endpoint.name}</h4>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                {endpoint.method}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {endpoint.description}
            </p>
            <code className="text-xs text-gray-500 block mb-3">
              {endpoint.path}
            </code>
            <button
              onClick={() => executeFSPRequest(endpoint)}
              disabled={loading && activeEndpoint === endpoint.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
            >
              {loading && activeEndpoint === endpoint.id ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Test Endpoint
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={testAllFSPEndpoints}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
      >
        {loading && activeEndpoint === 'all-fsp' ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
        Test All FSP Endpoints
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            FDC &amp; FSP Complete API Tester
          </h1>
          <p className="text-gray-400">
            Test all Flare Data Connector and Fast State Protocol endpoints
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSection('fdc')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'fdc'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              FDC Endpoints
            </button>
            <button
              onClick={() => setActiveSection('fsp')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'fsp'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              FSP Endpoints
            </button>
          </div>

          {activeSection === 'fdc' ? renderFDCSection() : renderFSPSection()}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-400 font-medium mb-1">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">
                {result.type === 'batch'
                  ? `${result.category} Batch Results`
                  : 'Result'}
              </h2>
            </div>

            {result.type === 'batch' ? (
              <div className="space-y-4">
                {result.results.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-blue-400">
                        {r.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            r.method === 'GET' ? 'bg-blue-600' : 'bg-green-600'
                          } text-white`}
                        >
                          {r.method}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            r.status === 'Success'
                              ? 'bg-green-600 text-white'
                              : r.status === 'Skipped'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                    <code className="text-gray-400 text-xs block mb-3">
                      {r.endpoint}
                    </code>
                    {r.message && (
                      <p className="text-yellow-400 text-sm mb-2">
                        {r.message}
                      </p>
                    )}
                    <div className="bg-black rounded p-3 overflow-x-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                        {JSON.stringify(r.data || { error: r.error }, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4 space-y-2 bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">
                      Endpoint:
                    </span>
                    <code className="text-blue-400 text-sm flex-1 break-all">
                      {result.endpoint}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">
                      Method:
                    </span>
                    <code className="text-green-400 text-sm">
                      {result.method}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">
                      Status:
                    </span>
                    <code className="text-yellow-400 text-sm">
                      {result.status} {result.statusText}
                    </code>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FDCCompleteTester;
