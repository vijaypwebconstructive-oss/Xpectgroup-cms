import React, { useState, useEffect } from 'react';
import {
  IncidentNavState,
  incidentNavigate,
  getIncidentState,
  subscribeIncident,
  syncIncidentFromPathname,
} from './incidentNavStore';
import IncidentsList     from './IncidentsList';
import IncidentCreate    from './IncidentCreate';
import IncidentDetail    from './IncidentDetail';
import CorrectiveActions from './CorrectiveActions';

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

  const goToList     = ()           => incidentNavigate('list');
  const goToCreate   = ()           => incidentNavigate('create');
  const goToDetail   = (id: string) => incidentNavigate('detail', id);
  const goToActions  = ()           => incidentNavigate('actions');

  switch (navState.view) {
    case 'list':
      return (
        <IncidentsList
          onSelectIncident={goToDetail}
          onCreateIncident={goToCreate}
          onNavigateActions={goToActions}
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
    case 'actions':
      return (
        <CorrectiveActions
          onBack={goToList}
          onSelectIncident={goToDetail}
        />
      );
    default:
      return (
        <IncidentsList
          onSelectIncident={goToDetail}
          onCreateIncident={goToCreate}
          onNavigateActions={goToActions}
        />
      );
  }
};

export default IncidentsModule;
