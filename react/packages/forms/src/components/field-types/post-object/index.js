import { useState, useEffect, useRef, useMemo } from '@wordpress/element';
import { useGatewayForm } from '@arcwp/gateway-forms'; // Import the shared context hook
import { getApiClient } from '@arcwp/gateway-data';
import './style.css';

const PostObjectFieldTypeInput = ({ config = {} }) => {
  const { register, setValue, watch, formState } = useGatewayForm(); // Get RHF methods from context
  const name = config.name;
  
  if (!name) {
    console.warn('PostObjectFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get error directly from context
  const fieldError = formState.errors[name];

  const {
    label,
    required = false,
    help = '',
    default: defaultValue = '',
    postType = 'post',
    multiple = false,
    resultsPerPage = 10,
    postStatus,
    placeholder,
  } = config;

  const currentValue = watch(name);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    register(name);
  }, [name, register]);

  // Initialize value on mount
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);

  useEffect(() => {
    if (currentValue) {
      fetchSelectedPost(currentValue);
    } else {
      setSelectedPost(null);
    }
  }, [currentValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSelectedPost = async (postId) => {
    const restBase = postType === 'post' ? 'posts' : postType;
    try {
      const client = getApiClient();
      const response = await client.get(`wp/v2/${restBase}/${postId}`);

      if (response.data) {
        setSelectedPost({
          id: response.data.id,
          title: response.data.title?.rendered || 'Untitled',
          type: response.data.type,
          status: response.data.status,
        });
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  };

  const searchPosts = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const params = {
        search: term,
        per_page: resultsPerPage,
        _fields: 'id,title,type,status',
      };

      if (postStatus) {
        params.status = postStatus;
      }

      const restBase = postType === 'post' ? 'posts' : postType;
      const client = getApiClient();
      const response = await client.get(`wp/v2/${restBase}`, { params });

      const results = response.data.map(post => ({
        id: post.id,
        title: post.title?.rendered || 'Untitled',
        type: post.type,
        status: post.status,
      }));

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching posts:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchPosts(term);
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setValue(name, post.id, { shouldValidate: true });
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedPost(null);
    setValue(name, '', { shouldValidate: true });
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!searchTerm) {
      searchPosts('');
    }
  };

  const selectedClasses = ['post-object-field__selected'];
  if (fieldError) {
    selectedClasses.push('post-object-field__selected--error');
  }

  const inputClasses = ['post-object-field__input'];
  if (fieldError) {
    inputClasses.push('post-object-field__input--error');
  }

  const labelText = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="post-object-field">
      <label htmlFor={name} className="post-object-field__label">
        {labelText}
        {required && <span className="post-object-field__required">*</span>}
      </label>

      {help && (
        <p className="post-object-field__help">{help}</p>
      )}

      <div className="post-object-field__wrapper" ref={dropdownRef}>
        {selectedPost ? (
          <div className={selectedClasses.join(' ')}>
            <div className="post-object-field__post-info">
              <div className="post-object-field__post-icon">
                <svg
                  className="post-object-field__icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="post-object-field__post-details">
                <div className="post-object-field__post-title">
                  {selectedPost.title}
                </div>
                <div className="post-object-field__post-meta">
                  <span className="post-object-field__post-id">
                    ID: {selectedPost.id}
                  </span>
                  {selectedPost.status && selectedPost.status !== 'publish' && (
                    <span className="post-object-field__post-status">
                      ({selectedPost.status})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="post-object-field__button post-object-field__button--remove"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              placeholder={placeholder || `Search ${postType}...`}
              className={inputClasses.join(' ')}
            />

            {isOpen && (searchResults.length > 0 || searching) && (
              <div className="post-object-field__dropdown">
                {searching ? (
                  <div className="post-object-field__dropdown-message">
                    Searching...
                  </div>
                ) : (
                  <ul className="post-object-field__results">
                    {searchResults.map((post) => (
                      <li key={post.id} className="post-object-field__result-item">
                        <button
                          type="button"
                          onClick={() => handleSelectPost(post)}
                          className="post-object-field__result-button"
                        >
                          <div className="post-object-field__result-title">
                            {post.title}
                          </div>
                          <div className="post-object-field__result-meta">
                            <span className="post-object-field__result-id">
                              ID: {post.id}
                            </span>
                            {post.status && post.status !== 'publish' && (
                              <span className="post-object-field__result-status">
                                ({post.status})
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {isOpen && !searching && searchTerm.length >= 2 && searchResults.length === 0 && (
              <div className="post-object-field__dropdown">
                <div className="post-object-field__dropdown-message">
                  No {postType} found
                </div>
              </div>
            )}

            {isOpen && searchTerm.length > 0 && searchTerm.length < 2 && (
              <div className="post-object-field__dropdown">
                <div className="post-object-field__dropdown-message">
                  Type at least 2 characters to search
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {fieldError && (
        <p className="post-object-field__error">{fieldError.message}</p>
      )}
    </div>
  );
};

const PostObjectFieldTypeDisplay = ({ value, config }) => {
  const [post, setPost] = useState(null);
  const postType = config?.postType || 'post';

  useEffect(() => {
    if (value) {
      fetchPost(value);
    } else {
      setPost(null);
    }
  }, [value]);

  const fetchPost = async (postId) => {
    const restBase = postType === 'post' ? 'posts' : postType;
    try {
      const client = getApiClient();
      const response = await client.get(`wp/v2/${restBase}/${postId}`);
      if (response.data) {
        setPost({
          title: response.data.title?.rendered || 'Untitled',
          id: response.data.id,
        });
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  };

  if (value === null || value === undefined || value === '') {
    return <span className="post-object-field__display post-object-field__display--empty">-</span>;
  }

  if (!post) {
    return <span className="post-object-field__display">Loading...</span>;
  }

  return (
    <span className="post-object-field__display">
      {post.title} <span className="post-object-field__display-id">(ID: {post.id})</span>
    </span>
  );
};

export const postObjectFieldType = {
  type: 'post-object',
  Input: PostObjectFieldTypeInput,
  Display: PostObjectFieldTypeDisplay,
  defaultConfig: {
    postType: 'post',
    resultsPerPage: 10,
  },
};

export const usePostObjectField = (config) => {
  return useMemo(() => ({
    Input: (props) => <PostObjectFieldTypeInput {...props} config={config} />,
    Display: (props) => <PostObjectFieldTypeDisplay {...props} config={config} />
  }), [config]);
};
