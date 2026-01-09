import { useState, useEffect, useRef, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms';
import Field from '../../field';
import { getApiClient } from '@arcwp/gateway-data';
import './user-style.css';

const UserControl = ({ config = {} }) => {
    const { register, setValue, watch, formState } = useGatewayForm();
    const name = config.name;
    
    if (!name) {
        console.warn('UserFieldTypeInput: No "name" provided in config');
        return null;
    }

    const fieldError = formState.errors[name];

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
            const client = getApiClient();
            const response = await client.get(`wp/v2/users/${userId}`, {
                params: { context: 'edit' }
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

            const client = getApiClient();
            const response = await client.get('wp/v2/users', { params });

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
        setValue(name, user.id, { shouldValidate: true });
        setSearchQuery('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setValue(name, null, { shouldValidate: true });
        setSearchQuery('');
    };

    return (
        <div className="user-field">
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
        </div>
    );
};

const UserFieldTypeInput = ({ config = {} }) => {
    return ( 
        <Field config={config} fieldControl={<UserControl config={config} />} />
    );
};

const UserFieldTypeDisplay = ({ value, config }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!value) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const client = getApiClient();
                const response = await client.get(`wp/v2/users/${value}`, {
                    params: { context: 'edit' }
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

export const userFieldType = {
    type: 'user',
    Input: UserFieldTypeInput,
    Display: UserFieldTypeDisplay,
    defaultConfig: {
        label: '',
        placeholder: 'Search for a user...',
        help: '',
        default: null,
        multiple: false,
        role: ''
    }
};

export const useUserField = (config) => {
    return useMemo(() => ({
        Input: (props) => <UserFieldTypeInput {...props} config={config} />,
        Display: (props) => <UserFieldTypeDisplay {...props} config={config} />
    }), [config]);
};
