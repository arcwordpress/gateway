import { useState, useEffect, useRef } from '@wordpress/element';
import axios from 'axios';

const PostObjectField = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  const currentValue = watch(fieldName);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const postType = fieldConfig.postType || 'post';
  const multiple = fieldConfig.multiple || false;

  useEffect(() => {
    register(fieldName);
  }, [fieldName, register]);

  useEffect(() => {
    if (currentValue) {
      fetchSelectedPost(currentValue);
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

  const fetchSelectedPost = async (postId) => {
    try {
      const response = await axios.get(
        `/wp-json/wp/v2/${postType}/${postId}`,
        {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

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
        per_page: fieldConfig.resultsPerPage || 10,
        _fields: 'id,title,type,status',
      };

      // Add status filter if specified
      if (fieldConfig.postStatus) {
        params.status = fieldConfig.postStatus;
      }

      const response = await axios.get(
        `/wp-json/wp/v2/${postType}`,
        {
          params,
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        }
      );

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
    setValue(fieldName, post.id);
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedPost(null);
    setValue(fieldName, '');
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!searchTerm) {
      // Load initial results
      searchPosts('');
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
        {selectedPost ? (
          // Display selected post
          <div className={`flex items-center justify-between p-3 border rounded-md bg-gray-50 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
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

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {selectedPost.title}
                </div>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    ID: {selectedPost.id}
                  </span>
                  {selectedPost.status && selectedPost.status !== 'publish' && (
                    <span className="text-xs text-amber-600">
                      ({selectedPost.status})
                    </span>
                  )}
                </div>
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
              placeholder={fieldConfig.placeholder || `Search ${postType}...`}
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
                    {searchResults.map((post) => (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPost(post)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">
                              ID: {post.id}
                            </span>
                            {post.status && post.status !== 'publish' && (
                              <span className="text-xs text-amber-600">
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
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
                No {postType} found
              </div>
            )}

            {isOpen && searchTerm.length > 0 && searchTerm.length < 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
                Type at least 2 characters to search
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

export default PostObjectField;
