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
import { UserAccessProvider } from './context/UserAccessContext';

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
                    <UserAccessProvider>
                      <App />
                    </UserAccessProvider>
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
