import React from 'react';
import { BillingSection } from '../../../../components/finance';
import type { Invoice } from '../../finance-payroll/types';

interface BillingInformationProps {
  invoice?: Invoice | null;
}

const BillingInformation: React.FC<BillingInformationProps> = ({ invoice }) => (
  <BillingSection billBy={invoice?.billBy} billTo={invoice?.billTo} />
);

export default BillingInformation;
