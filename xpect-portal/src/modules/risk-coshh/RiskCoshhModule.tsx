import React, { useState, useEffect } from 'react';
import {
  RiskNavState,
  riskNavigate,
  getRiskState,
  subscribeRisk,
  syncRiskFromPathname,
} from './riskNavStore';
import RiskAssessmentsList  from './RiskAssessmentsList';
import RiskAssessmentDetail from './RiskAssessmentDetail';
import RAMSList             from './RAMSList';
import RAMSDetail           from './RAMSDetail';
import COSHHRegister        from './COSHHRegister';
import COSHHDetail          from './COSHHDetail';
import SDSLibrary           from './SDSLibrary';

const RiskCoshhModule: React.FC = () => {
  const [navState, setNavState] = useState<RiskNavState>(() => {
    syncRiskFromPathname(window.location.pathname);
    return getRiskState();
  });

  useEffect(() => {
    const unsub = subscribeRisk(setNavState);
    const handlePopState = () => syncRiskFromPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigation helpers
  const goToList        = ()           => riskNavigate('risk-list');
  const goToRisk        = (id: string) => riskNavigate('risk-detail', id);
  const goToRAMSList    = ()           => riskNavigate('rams-list');
  const goToRAMS        = (id: string) => riskNavigate('rams-detail', id);
  const goToCOSHH       = ()           => riskNavigate('coshh-register');
  const goToChemical    = (id: string) => riskNavigate('coshh-detail', id);
  const goToSDS         = ()           => riskNavigate('sds-library');

  switch (navState.view) {
    case 'risk-list':
      return (
        <RiskAssessmentsList
          onSelectRisk={goToRisk}
          onNavigateRAMS={goToRAMSList}
          onNavigateCOSHH={goToCOSHH}
          onNavigateSDS={goToSDS}
        />
      );

    case 'risk-detail':
      return (
        <RiskAssessmentDetail
          riskId={navState.id ?? ''}
          onBack={goToList}
        />
      );

    case 'rams-list':
      return (
        <RAMSList
          onSelectRAMS={goToRAMS}
          onBack={goToList}
        />
      );

    case 'rams-detail':
      return (
        <RAMSDetail
          ramsId={navState.id ?? ''}
          onBack={goToRAMSList}
        />
      );

    case 'coshh-register':
      return (
        <COSHHRegister
          onSelectChemical={goToChemical}
          onBack={goToList}
          onNavigateSDS={goToSDS}
        />
      );

    case 'coshh-detail':
      return (
        <COSHHDetail
          chemicalId={navState.id ?? ''}
          onBack={goToCOSHH}
          onViewSDS={id => { goToSDS(); void id; }}
        />
      );

    case 'sds-library':
      return (
        <SDSLibrary
          onBack={goToList}
          onNavigateCOSHH={goToCOSHH}
        />
      );

    default:
      return (
        <RiskAssessmentsList
          onSelectRisk={goToRisk}
          onNavigateRAMS={goToRAMSList}
          onNavigateCOSHH={goToCOSHH}
          onNavigateSDS={goToSDS}
        />
      );
  }
};

export default RiskCoshhModule;
