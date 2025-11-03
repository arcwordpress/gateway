import { createElement } from '@wordpress/element';
import { useState, useEffect, useRef } from '@wordpress/element';
import axios from 'axios';
import './style.css';

/**
 * UserInput Component
 * Renders a user selection field with search and dropdown
 */
export const UserInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
    const name = inputProps.name || config.name;
    if (!name) {
        console.warn('UserInput: No "name" provided in props or config');
        return null;
    }

    const {
        label = '',
        placeholder = 'Search for a user...',
        help = '',
        default: defaultValue = null,
        multiple = false,
        role = ''
    } = config;

    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const currentValue = watch(name);

    // Initialize value on mount
    useEffect(() => {
        register(name);

        if (defaultValue && !currentValue) {
            setValue(name, defaultValue);
            fetchSelectedUser(defaultValue);
        } else if (currentValue) {
            fetchSelectedUser(currentValue);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSelectedUser = async (userId) => {
        if (!userId) return;

        try {
            const response = await axios.get(`/wp-json/wp/v2/users/${userId}`, {
                params: { context: 'edit' },
                headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
            });

            setSelectedUser({
                id: response.data.id,
                name: response.data.name,
                email: response.data.email || '',
                roles: response.data.roles || [],
                avatar: response.data.avatar_urls?.['48'] || ''
            });
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };

    const searchUsers = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const params = {
                search: query,
                per_page: 10,
                context: 'edit'
            };

            if (role) {
                params.roles = role;
            }

            const response = await axios.get('/wp-json/wp/v2/users', {
                params,
                headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
            });

            const users = response.data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email || '',
                roles: user.roles || [],
                avatar: user.avatar_urls?.['48'] || ''
            }));

            setSearchResults(users);
            setShowDropdown(true);
        } catch (err) {
            console.error('Error searching users:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchUsers(query);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setValue(name, user.id);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setValue(name, null);
        setSearchQuery('');
    };

    return (
        <div className="user-field">
            {label && (
                <label htmlFor={name} className="user-field__label">
                    {label}
                </label>
            )}

            {selectedUser ? (
                <div className="user-field__selected">
                    <div className="user-field__user-info">
                        {selectedUser.avatar && (
                            <img
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                                className="user-field__avatar"
                            />
                        )}
                        <div className="user-field__user-details">
                            <div className="user-field__user-name">{selectedUser.name}</div>
                            {selectedUser.email && (
                                <div className="user-field__user-email">{selectedUser.email}</div>
                            )}
                            {selectedUser.roles && selectedUser.roles.length > 0 && (
                                <div className="user-field__user-roles">
                                    {selectedUser.roles.map(role => (
                                        <span key={role} className="user-field__role-badge">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClearSelection}
                        className="user-field__clear-button"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div className="user-field__search-container" ref={dropdownRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={placeholder}
                        className="user-field__search-input"
                        onFocus={() => searchQuery && setShowDropdown(true)}
                    />

                    {isSearching && (
                        <div className="user-field__loading">Searching...</div>
                    )}

                    {showDropdown && searchResults.length > 0 && (
                        <div className="user-field__dropdown">
                            {searchResults.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => handleSelectUser(user)}
                                    className="user-field__dropdown-item"
                                >
                                    {user.avatar && (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="user-field__avatar"
                                        />
                                    )}
                                    <div className="user-field__user-details">
                                        <div className="user-field__user-name">{user.name}</div>
                                        {user.email && (
                                            <div className="user-field__user-email">{user.email}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showDropdown && !isSearching && searchQuery && searchResults.length === 0 && (
                        <div className="user-field__no-results">No users found</div>
                    )}
                </div>
            )}

            {help && <p className="user-field__help">{help}</p>}
            {error && <p className="user-field__error">{error.message}</p>}
        </div>
    );
};

/**
 * UserDisplay Component
 * Displays selected user with avatar and details
 */
export const UserDisplay = ({ value, fieldConfig = {} }) => {
    const { label = '' } = fieldConfig;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!value) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axios.get(`/wp-json/wp/v2/users/${value}`, {
                    params: { context: 'edit' },
                    headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
                });

                setUser({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email || '',
                    roles: response.data.roles || [],
                    avatar: response.data.avatar_urls?.['48'] || ''
                });
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [value]);

    return (
        <div className="user-field">
            {label && <span className="user-field__label">{label}</span>}
            <div className="user-field__display">
                {loading ? (
                    <span className="user-field__loading">Loading user...</span>
                ) : user ? (
                    <div className="user-field__user-info">
                        {user.avatar && (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="user-field__avatar"
                            />
                        )}
                        <div className="user-field__user-details">
                            <div className="user-field__user-name">{user.name}</div>
                            {user.email && (
                                <div className="user-field__user-email">{user.email}</div>
                            )}
                            {user.roles && user.roles.length > 0 && (
                                <div className="user-field__user-roles">
                                    {user.roles.map(role => (
                                        <span key={role} className="user-field__role-badge">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="user-field__display--empty">No user selected</span>
                )}
            </div>
        </div>
    );
};

/**
 * Field Definition for Registry
 */
export const userFieldDefinition = {
    type: 'user',
    Input: UserInput,
    Display: UserDisplay,
    defaultConfig: {
        label: '',
        placeholder: 'Search for a user...',
        help: '',
        default: null,
        multiple: false,
        role: ''
    }
};

/**
 * Custom Hook for User Field
 */
export const useUserField = (fieldName, fieldConfig, formMethods) => {
    const { watch, setValue } = formMethods;
    const value = watch(fieldName);

    const clearUser = () => {
        setValue(fieldName, null);
    };

    return {
        value,
        clearUser,
        hasValue: !!value
    };
};

export default UserInput;
