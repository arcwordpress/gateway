import { useState } from 'react';

function RouteTest({ route, collectionKey }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authType, setAuthType] = useState('cookie');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [params, setParams] = useState({});
  const [body, setBody] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [codeExamples, setCodeExamples] = useState(null);
  const [copied, setCopied] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    setResponse(null);
    // Initialize params and body based on route type
    if (route.type === 'get_one' || route.type === 'update' || route.type === 'delete') {
      setParams({ id: '1' });
    } else {
      setParams({});
    }

    if (route.type === 'create' || route.type === 'update') {
      setBody({ title: 'Test Item', status: 'active' });
    } else {
      setBody({});
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResponse(null);
    setCopied(false);
  };

  const buildUrl = () => {
    let url = window.gatewayAdminScript.apiUrl + route.namespace + '/' + route.path;

    // Replace route parameters
    if (route.type === 'get_one' || route.type === 'update' || route.type === 'delete') {
      url = url.replace(/\/\(\?P<id>[^)]+\)/, '/' + (params.id || '1'));
    }

    return url;
  };

  const testRoute = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const url = buildUrl();
      const startTime = performance.now();

      // Build request headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Handle authentication
      if (authType === 'cookie') {
        headers['X-WP-Nonce'] = window.gatewayAdminScript.nonce;
      } else if (authType === 'basic') {
        if (!username || !password) {
          throw new Error('Username and password are required for basic auth');
        }
        headers['Authorization'] = 'Basic ' + btoa(username + ':' + password);
      }
      // For 'public', no auth headers

      // Make direct request to the route
      const fetchOptions = {
        method: route.method,
        headers: headers,
      };

      // Include credentials for cookie auth
      if (authType === 'cookie') {
        fetchOptions.credentials = 'include';
      }

      // Add body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Get response data
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      setResponse({
        success: true,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
        },
        request: {
          method: route.method,
          url: url,
          headers: headers,
          body: body,
        },
        duration: duration,
      });

      // Generate code examples (client-side, instant)
      generateCodeExamples();

      setActiveTab('response');
    } catch (err) {
      setResponse({
        success: false,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCodeExamples = () => {
    const url = buildUrl();
    const examples = {
      curl: generateCurl(url),
      fetch: generateFetch(url),
      axios: generateAxios(url),
      php_curl: generatePhpCurl(url),
      php_guzzle: generatePhpGuzzle(url),
    };
    setCodeExamples(examples);
  };

  const generateCurl = (url) => {
    let cmd = `curl -X ${route.method} \\\n  '${url}'`;

    if (authType === 'basic') {
      cmd += ` \\\n  -u '${username || 'your_username'}:${password || 'your_app_password'}'`;
    } else if (authType === 'cookie') {
      cmd += ` \\\n  -H 'X-WP-Nonce: ${window.gatewayAdminScript.nonce}' \\\n  --cookie 'wordpress_logged_in_xxx=your_cookie_value'`;
    }

    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      const jsonBody = JSON.stringify(body, null, 2).replace(/'/g, "\\'");
      cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${jsonBody}'`;
    }

    return cmd;
  };

  const generateFetch = (url) => {
    let code = `fetch('${url}', {\n  method: '${route.method}',\n  headers: {\n    'Content-Type': 'application/json'`;

    if (authType === 'basic') {
      const encoded = btoa(`${username || 'your_username'}:${password || 'your_app_password'}`);
      code += `,\n    'Authorization': 'Basic ${encoded}'`;
    } else if (authType === 'cookie') {
      code += `,\n    'X-WP-Nonce': '${window.gatewayAdminScript.nonce}'`;
    }

    code += '\n  }';

    if (authType === 'cookie') {
      code += ',\n  credentials: \'include\'';
    }

    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      code += ',\n  body: JSON.stringify(' + JSON.stringify(body, null, 2).replace(/\n/g, '\n  ') + ')';
    }

    code += '\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(\'Error:\', error));';

    return code;
  };

  const generateAxios = (url) => {
    const methodLower = route.method.toLowerCase();

    let code;
    if (['post', 'put', 'patch'].includes(methodLower) && Object.keys(body).length > 0) {
      code = `axios.${methodLower}('${url}', ${JSON.stringify(body, null, 2)}, {\n  headers: {\n    'Content-Type': 'application/json'`;
    } else {
      code = `axios.${methodLower}('${url}', {\n  headers: {\n    'Content-Type': 'application/json'`;
    }

    if (authType === 'basic') {
      const encoded = btoa(`${username || 'your_username'}:${password || 'your_app_password'}`);
      code += `,\n    'Authorization': 'Basic ${encoded}'`;
    } else if (authType === 'cookie') {
      code += `,\n    'X-WP-Nonce': '${window.gatewayAdminScript.nonce}'`;
    }

    code += '\n  }';

    if (authType === 'cookie') {
      code += ',\n  withCredentials: true';
    }

    code += '\n})\n  .then(response => console.log(response.data))\n  .catch(error => console.error(\'Error:\', error));';

    return code;
  };

  const generatePhpCurl = (url) => {
    let code = `<?php\n$ch = curl_init();\n\ncurl_setopt_array($ch, [\n  CURLOPT_URL => '${url}',\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_CUSTOMREQUEST => '${route.method}',\n  CURLOPT_HTTPHEADER => [\n    'Content-Type: application/json'`;

    if (authType === 'basic') {
      code += `\n  ],\n  CURLOPT_USERPWD => '${username || 'your_username'}:${password || 'your_app_password'}'`;
    } else if (authType === 'cookie') {
      code += `,\n    'X-WP-Nonce: ${window.gatewayAdminScript.nonce}'\n  ],\n  CURLOPT_COOKIE => 'wordpress_logged_in_xxx=your_cookie_value'`;
    } else {
      code += '\n  ]';
    }

    if (['POST', 'PUT', 'PATCH'].includes(route.method) && Object.keys(body).length > 0) {
      code += `,\n  CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')})`;
    }

    code += '\n]);\n\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\n$data = json_decode($response, true);\nvar_dump($data);';

    return code;
  };

  const generatePhpGuzzle = (url) => {
    const methodLower = route.method.toLowerCase();

    let code = `<?php\nrequire 'vendor/autoload.php';\n\nuse GuzzleHttp\\Client;\n\n$client = new Client();\n\n`;

    if (['post', 'put', 'patch'].includes(methodLower) && Object.keys(body).length > 0) {
      code += `$response = $client->${methodLower}('${url}', [\n  'json' => ${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')},\n  'headers' => [\n    'Content-Type' => 'application/json'`;
    } else {
      code += `$response = $client->${methodLower}('${url}', [\n  'headers' => [\n    'Content-Type' => 'application/json'`;
    }

    if (authType === 'basic') {
      code += `\n  ],\n  'auth' => ['${username || 'your_username'}', '${password || 'your_app_password'}']`;
    } else if (authType === 'cookie') {
      code += `,\n    'X-WP-Nonce' => '${window.gatewayAdminScript.nonce}'\n  ],\n  'cookies' => true`;
    } else {
      code += '\n  ]';
    }

    code += '\n]);\n\n$statusCode = $response->getStatusCode();\n$data = json_decode($response->getBody(), true);\nvar_dump($data);';

    return code;
  };

  const addParam = () => {
    const key = prompt('Parameter name:');
    if (key) {
      setParams({ ...params, [key]: '' });
    }
  };

  const updateParam = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  const removeParam = (key) => {
    const newParams = { ...params };
    delete newParams[key];
    setParams(newParams);
  };

  const addBodyField = () => {
    const key = prompt('Field name:');
    if (key) {
      setBody({ ...body, [key]: '' });
    }
  };

  const updateBodyField = (key, value) => {
    setBody({ ...body, [key]: value });
  };

  const removeBodyField = (key) => {
    const newBody = { ...body };
    delete newBody[key];
    setBody(newBody);
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        Test Route
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Test Route</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 rounded font-semibold text-xs ${
                      route.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : route.method === 'POST'
                        ? 'bg-green-100 text-green-800'
                        : route.method === 'PUT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : route.method === 'DELETE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {route.method}
                  </span>
                  <code className="text-sm text-gray-700">{route.displayRoute}</code>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('request')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'request'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Request
                </button>
                <button
                  onClick={() => setActiveTab('response')}
                  className={`py-3 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'response'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Response
                </button>
                <button
                  onClick={() => {
                    setActiveTab('code');
                    if (!codeExamples) generateCodeExamples();
                  }}
                  className={`py-3 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'code'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Code Examples
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === 'request' && (
                <div className="space-y-4">
                  {/* Auth Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authentication Method
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="cookie">Cookie (Logged in user)</option>
                      <option value="basic">Basic Auth (Username & App Password)</option>
                      <option value="public">Public (No authentication)</option>
                    </select>
                  </div>

                  {/* Basic Auth Credentials */}
                  {authType === 'basic' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="your_username"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Application Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  {(route.method === 'GET' || route.type === 'get_one' || route.type === 'update' || route.type === 'delete') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Parameters
                        </label>
                        {route.method === 'GET' && route.type === 'get_many' && (
                          <button
                            onClick={addParam}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            + Add Parameter
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {Object.keys(params).map((key) => (
                          <div key={key} className="flex gap-2">
                            <input
                              type="text"
                              value={key}
                              disabled
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                            <input
                              type="text"
                              value={params[key]}
                              onChange={(e) => updateParam(key, e.target.value)}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {route.method === 'GET' && route.type === 'get_many' && (
                              <button
                                onClick={() => removeParam(key)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body */}
                  {['POST', 'PUT', 'PATCH'].includes(route.method) && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Request Body (JSON)
                        </label>
                        <button
                          onClick={addBodyField}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          + Add Field
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Object.keys(body).map((key) => (
                          <div key={key} className="flex gap-2">
                            <input
                              type="text"
                              value={key}
                              disabled
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                            <input
                              type="text"
                              value={body[key]}
                              onChange={(e) => updateBodyField(key, e.target.value)}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => removeBodyField(key)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'response' && (
                <div>
                  {response === null ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Click "Send Request" to see the response</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {response.success ? (
                        <>
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <span className="text-green-800 font-medium">
                                Status: {response.response.status} {response.response.statusText}
                              </span>
                              {response.duration && (
                                <span className="text-green-700 text-sm">
                                  ({response.duration}ms)
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Response Body:</h4>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{JSON.stringify(response.response.body, null, 2)}</code>
                            </pre>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 font-medium">Error:</p>
                          <p className="text-red-700 mt-1">{response.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'code' && (
                <div>
                  {!codeExamples ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Configure your request in the Request tab first</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Code Tabs */}
                      <div className="flex space-x-2 border-b border-gray-200">
                        <button
                          onClick={() => setActiveCodeTab('curl')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeCodeTab === 'curl'
                              ? 'border-b-2 border-indigo-500 text-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          CURL
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('fetch')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeCodeTab === 'fetch'
                              ? 'border-b-2 border-indigo-500 text-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Fetch API
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('axios')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeCodeTab === 'axios'
                              ? 'border-b-2 border-indigo-500 text-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Axios
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('php_curl')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeCodeTab === 'php_curl'
                              ? 'border-b-2 border-indigo-500 text-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          PHP cURL
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('php_guzzle')}
                          className={`px-4 py-2 text-sm font-medium ${
                            activeCodeTab === 'php_guzzle'
                              ? 'border-b-2 border-indigo-500 text-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          PHP Guzzle
                        </button>
                      </div>

                      {/* Code Display */}
                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(codeExamples[activeCodeTab])}
                          className="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{codeExamples[activeCodeTab]}</code>
                        </pre>
                      </div>

                      {/* Authentication Note */}
                      {authType === 'cookie' && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Cookie authentication requires the request to be made from the same domain
                            with a valid WordPress session. The nonce shown is temporary and will expire.
                          </p>
                        </div>
                      )}
                      {authType === 'basic' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> For Basic Auth, you need to create an Application Password in WordPress
                            (Users → Profile → Application Passwords).
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={testRoute}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RouteTest;
