import React, { useState, useEffect } from 'react';
import {
  ProspectNavState,
  prospectNavigate,
  getProspectState,
  subscribeProspect,
  syncProspectFromPathname,
} from './prospectNavStore';
import ProspectListPage from './ProspectListPage';
import ProspectCreate from './ProspectCreate';
import ProspectDetailPage from './ProspectDetailPage';

const ProspectModule: React.FC = () => {
  const [navState, setNavState] = useState<ProspectNavState>(() => {
    syncProspectFromPathname(window.location.pathname);
    return getProspectState();
  });

  useEffect(() => {
    const unsub = subscribeProspect(setNavState);
    const handlePopState = () => syncProspectFromPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goToList = () => prospectNavigate('list');
  const goToCreate = () => prospectNavigate('create');
  const goToDetail = (id: string) => prospectNavigate('detail', id);

  switch (navState.view) {
    case 'list':
      return (
        <ProspectListPage
          onView={goToDetail}
          onEdit={goToDetail}
          onAdd={goToCreate}
        />
      );
    case 'create':
      return (
        <ProspectCreate
          onBack={goToList}
          onCreated={id => goToDetail(id)}
        />
      );
    case 'detail':
      return (
        <ProspectDetailPage
          prospectId={navState.id ?? ''}
          onBack={goToList}
        />
      );
    default:
      return (
        <ProspectListPage
          onView={goToDetail}
          onEdit={goToDetail}
          onAdd={goToCreate}
        />
      );
  }
};

export default ProspectModule;
