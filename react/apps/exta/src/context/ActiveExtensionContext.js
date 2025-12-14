import { createContext, useContext, useState } from '@wordpress/element';

const ActiveExtensionContext = createContext();

export const useActiveExtension = () => {
  const context = useContext(ActiveExtensionContext);
  if (!context) {
    throw new Error('useActiveExtension must be used within ActiveExtensionProvider');
  }
  return context;
};

export const ActiveExtensionProvider = ({ children }) => {
  const [activeExtension, setActiveExtension] = useState(null);

  const value = {
    activeExtension,
    setActiveExtension,
  };

  return (
    <ActiveExtensionContext.Provider value={value}>
      {children}
    </ActiveExtensionContext.Provider>
  );
};
