import React, { useState, useEffect } from 'react';
import {
  UserNavState,
  userNavigate,
  getUserState,
  subscribeUser,
  syncUserFromPathname,
} from './userNavStore';
import UsersList   from './UsersList';
import UserDetail  from './UserDetail';

const UserAccessModule: React.FC = () => {
  const [navState, setNavState] = useState<UserNavState>(() => {
    syncUserFromPathname(window.location.pathname);
    return getUserState();
  });

  useEffect(() => {
    const unsub = subscribeUser(setNavState);
    const handlePopState = () => syncUserFromPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goToList   = () => userNavigate('list');
  const goToDetail = (id: string) => userNavigate('detail', id);

  switch (navState.view) {
    case 'list':
      return <UsersList onSelectUser={goToDetail} />;
    case 'detail':
      return <UserDetail userId={navState.id ?? ''} onBack={goToList} />;
    default:
      return <UsersList onSelectUser={goToDetail} />;
  }
};

export default UserAccessModule;
