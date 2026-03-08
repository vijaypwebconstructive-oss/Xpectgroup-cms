import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CleanersProvider } from './context/CleanersContext';
import { TrainingProvider } from './context/TrainingContext';
import { PPEInvoiceProvider } from './context/PPEInvoiceContext';
import { PPERecordsProvider } from './context/PPERecordsContext';
import { RiskCoshhProvider } from './context/RiskCoshhContext';
import { ClientsSitesProvider } from './context/ClientsSitesContext';
import { PolicyDocumentsProvider } from './context/PolicyDocumentsContext';
import { IncidentsProvider } from './context/IncidentsContext';
import { ProspectsProvider } from './context/ProspectContext';
import { UserAccessProvider } from './context/UserAccessContext';
import { FinanceProvider } from './context/FinanceContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CleanersProvider>
      <TrainingProvider>
        <PPEInvoiceProvider>
          <PPERecordsProvider>
            <RiskCoshhProvider>
              <ClientsSitesProvider>
                <PolicyDocumentsProvider>
                  <IncidentsProvider>
                    <ProspectsProvider>
                      <FinanceProvider>
                      <UserAccessProvider>
                        <App />
                      </UserAccessProvider>
                      </FinanceProvider>
                    </ProspectsProvider>
                  </IncidentsProvider>
                </PolicyDocumentsProvider>
              </ClientsSitesProvider>
            </RiskCoshhProvider>
          </PPERecordsProvider>
        </PPEInvoiceProvider>
      </TrainingProvider>
    </CleanersProvider>
  </React.StrictMode>
);
