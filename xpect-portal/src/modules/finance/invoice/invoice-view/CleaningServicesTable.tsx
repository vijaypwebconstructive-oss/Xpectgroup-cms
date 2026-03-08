import React from 'react';
import { ServiceItemsTableDisplay } from '../../../../components/finance';
import type { Invoice } from '../../finance-payroll/types';

interface CleaningServicesTableProps {
  invoice?: Invoice | null;
}

const CleaningServicesTable: React.FC<CleaningServicesTableProps> = ({ invoice }) => (
  <ServiceItemsTableDisplay
    items={(invoice?.serviceItems || []).map(s => ({
      serviceDescription: s.serviceDescription,
      siteLocation: s.siteLocation,
      quantity: s.quantity,
      rate: s.rate,
      discount: s.discount,
      amount: s.amount,
    }))}
    emptyPlaceholder={[
      { serviceDescription: 'Office Cleaning Service (Daily)', quantity: '20 visits', rate: 120, discount: 0, amount: 2400 },
      { serviceDescription: 'Washroom Sanitization Service', quantity: '20 visits', rate: 35, discount: 0, amount: 700 },
    ]}
  />
);

export default CleaningServicesTable;
