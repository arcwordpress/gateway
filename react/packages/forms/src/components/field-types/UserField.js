import { useState, useEffect, useRef } from '@wordpress/element';
import axios from 'axios';

const UserField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  useEffect(() => {
    if (currentValue) {
      fetchSelectedUser(currentValue);
    }
  }, [currentValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSelectedUser = async (userId) => {
    try {
      const response = await axios.get(
        `/wp-json/wp/v2/users/${userId}`,
        {
          params: {
            context: 'edit',
          },
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

      if (response.data) {
        setSelectedUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          roles: response.data.roles || [],
          avatar: response.data.avatar_urls?.['48'] || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const searchUsers = async (term) => {
    setSearching(true);

    try {
      const params = {
        context: 'edit',
        per_page: fieldConfig.resultsPerPage || 10,
      };

      // Add search term if provided
      if (term && term.length >= 2) {
        params.search = term;
      }

      // Add role filter if specified
      if (fieldConfig.roles && fieldConfig.roles.length > 0) {
        params.roles = fieldConfig.roles.join(',');
      }

      const response = await axios.get(
        '/wp-json/wp/v2/users',
        {
          params,
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

      const results = response.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles || [],
        avatar: user.avatar_urls?.['48'] || '',
      }));

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchUsers(term);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setValue(fieldName, user.id);
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setValue(fieldName, '');
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!searchTerm) {
      // Load initial results
      searchUsers('');
    }
  };

  return (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {fieldConfig.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldConfig.helpText && (
        <p className="text-sm text-gray-500 mb-2">{fieldConfig.helpText}</p>
      )}

      <div className="relative" ref={dropdownRef}>
        {selectedUser ? (
          // Display selected user
          <div className={`flex items-center justify-between p-3 border rounded-md bg-gray-50 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {selectedUser.avatar && (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {selectedUser.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {selectedUser.email}
                </div>
                {selectedUser.roles && selectedUser.roles.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {selectedUser.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="ml-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 border border-red-300 flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          // Search input
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              placeholder={fieldConfig.placeholder || 'Search users...'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />

            {/* Dropdown results */}
            {isOpen && (searchResults.length > 0 || searching) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-3"
                        >
                          {user.avatar && (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {user.email}
                            </div>
                            {user.roles && user.roles.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {isOpen && !searching && searchResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
                {searchTerm.length >= 2 ? 'No users found' : 'Start typing to search users'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default UserField;
