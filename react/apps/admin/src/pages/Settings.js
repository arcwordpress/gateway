import { useState, useEffect } from 'react';

const Settings = () => {
    const [port, setPort] = useState('');
    const [localPort, setLocalPort] = useState('');
    const [anthropicApiKey, setAnthropicApiKey] = useState('');
    const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${window.gatewayAdminScript.apiUrl}gateway/v1/settings`,
                {
                    headers: {
                        'X-WP-Nonce': window.gatewayAdminScript.nonce,
                    },
                }
            );
            const data = await response.json();
            setPort(data.port || '');
            setLocalPort(data.port || '');
            setHasAnthropicKey(data.has_anthropic_key || false);
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = { port: localPort };

            // Only include API key if it was changed
            if (anthropicApiKey) {
                payload.anthropic_api_key = anthropicApiKey;
            }

            const response = await fetch(
                `${window.gatewayAdminScript.apiUrl}gateway/v1/settings`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.gatewayAdminScript.nonce,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setPort(localPort);
                setHasAnthropicKey(data.has_anthropic_key || false);
                setAnthropicApiKey(''); // Clear the input after save
                setSuccess(data.message || 'Settings saved successfully.');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setLocalPort('');
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(
                `${window.gatewayAdminScript.apiUrl}gateway/v1/test-connection`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.gatewayAdminScript.nonce,
                    },
                }
            );

            const data = await response.json();
            setTestResult(data);
        } catch (err) {
            setTestResult({
                success: false,
                error: err.message,
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-gray-600">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Port Settings Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Database Port Settings
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label
                            htmlFor="port"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Database Port
                        </label>
                        <input
                            type="number"
                            id="port"
                            min="1"
                            max="65535"
                            value={localPort}
                            onChange={(e) => setLocalPort(e.target.value)}
                            placeholder="3306"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Enter a custom port number for database connections. Leave
                            empty to use default (3306). For Local WP, check the site
                            overview for the correct MySQL port.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-600 text-sm flex items-center">
                                <span className="mr-2">✗</span>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-600 text-sm flex items-center">
                                <span className="mr-2">✓</span>
                                {success}
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 rounded font-medium transition-colors ${
                                saving
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                            Reset to Default
                        </button>
                    </div>
                </form>
            </div>

            {/* Maze AI Settings Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Maze AI Settings
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label
                            htmlFor="anthropic_api_key"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Anthropic API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                id="anthropic_api_key"
                                value={anthropicApiKey}
                                onChange={(e) => setAnthropicApiKey(e.target.value)}
                                placeholder={hasAnthropicKey ? '••••••••••••••••' : 'sk-ant-...'}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-900"
                            >
                                {showApiKey ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-500">
                                Enter your Anthropic API key to enable Maze AI features.
                                {hasAnthropicKey && (
                                    <span className="ml-1 text-green-600 font-medium">
                                        (Key is currently set)
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">
                                Get your API key from{' '}
                                <a
                                    href="https://console.anthropic.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    Anthropic Console
                                </a>
                                . The key is encrypted and stored securely.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-600 text-sm flex items-center">
                                <span className="mr-2">✗</span>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-600 text-sm flex items-center">
                                <span className="mr-2">✓</span>
                                {success}
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 rounded font-medium transition-colors ${
                                saving
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save API Key'}
                        </button>
                        {hasAnthropicKey && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to remove the stored API key?')) {
                                        setSaving(true);
                                        try {
                                            const response = await fetch(
                                                `${window.gatewayAdminScript.apiUrl}gateway/v1/settings`,
                                                {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-WP-Nonce': window.gatewayAdminScript.nonce,
                                                    },
                                                    body: JSON.stringify({ anthropic_api_key: '' }),
                                                }
                                            );
                                            const data = await response.json();
                                            if (response.ok) {
                                                setHasAnthropicKey(false);
                                                setAnthropicApiKey('');
                                                setSuccess('API key removed successfully.');
                                                setTimeout(() => setSuccess(''), 3000);
                                            }
                                        } catch (err) {
                                            setError('Failed to remove API key');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }
                                }}
                                className="px-4 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Remove Key
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Test Connection Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Test Database Connection
                </h2>
                <button
                    onClick={testConnection}
                    disabled={testing}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                        testing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {testing ? 'Testing...' : 'Test Connection'}
                </button>

                {testResult && (
                    <div
                        className={`mt-4 p-4 rounded ${
                            testResult.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        {testResult.success ? (
                            <div className="space-y-2">
                                <p className="text-green-600 font-semibold">
                                    ✓ Connection Successful
                                </p>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Server Version:</span>{' '}
                                        {testResult.server_version}
                                    </div>
                                    <div>
                                        <span className="font-medium">Tables Found:</span>{' '}
                                        {testResult.table_count}
                                    </div>
                                    {testResult.custom_port && (
                                        <div>
                                            <span className="font-medium">Custom Port:</span>{' '}
                                            {testResult.custom_port}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-red-600 font-semibold">
                                    ✗ Connection Failed
                                </p>
                                <div className="mt-2 text-sm text-red-700 font-mono bg-red-100 p-3 rounded">
                                    {testResult.error}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
