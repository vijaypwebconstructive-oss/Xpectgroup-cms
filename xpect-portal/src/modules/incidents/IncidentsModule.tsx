import React, { useState, useEffect } from 'react';
import {
  IncidentNavState,
  incidentNavigate,
  getIncidentState,
  subscribeIncident,
  syncIncidentFromPathname,
} from './incidentNavStore';
import IncidentsList  from './IncidentsList';
import IncidentCreate from './IncidentCreate';
import IncidentDetail from './IncidentDetail';

const IncidentsModule: React.FC = () => {
  const [navState, setNavState] = useState<IncidentNavState>(() => {
    syncIncidentFromPathname(window.location.pathname);
    return getIncidentState();
  });

  useEffect(() => {
    const unsub = subscribeIncident(setNavState);
    const handlePopState = () => syncIncidentFromPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const goToList   = ()           => incidentNavigate('list');
  const goToCreate = ()           => incidentNavigate('create');
  const goToDetail = (id: string) => incidentNavigate('detail', id);

  switch (navState.view) {
    case 'list':
      return (
        <IncidentsList
          onSelectIncident={goToDetail}
          onCreateIncident={goToCreate}
        />
      );
    case 'create':
      return (
        <IncidentCreate
          onBack={goToList}
          onCreated={(id) => goToDetail(id)}
        />
      );
    case 'detail':
      return (
        <IncidentDetail
          incidentId={navState.id ?? ''}
          onBack={goToList}
        />
      );
    default:
      return (
        <IncidentsList
          onSelectIncident={goToDetail}
          onCreateIncident={goToCreate}
        />
      );
  }
};

export default IncidentsModule;
