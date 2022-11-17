import { createContext, useCallback, useContext, useState } from "react";

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((text, type) => {
    const id = Math.random();
    setNotifications((ns) => [{ id, text, type }, ...ns]);

    setTimeout(() => {
      setNotifications((ns) => ns.slice(0, -1));
    }, 7000);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        addNotification,
        notifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
