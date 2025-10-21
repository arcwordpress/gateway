import { useState, useEffect } from 'react';

const Settings = () => {
    const [port, setPort] = useState('');
    const [localPort, setLocalPort] = useState('');
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
            const response = await fetch(
                `${window.gatewayAdminScript.apiUrl}gateway/v1/settings`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.gatewayAdminScript.nonce,
                    },
                    body: JSON.stringify({ port: localPort }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setPort(localPort);
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
