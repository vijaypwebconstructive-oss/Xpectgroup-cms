/// <reference types="vite/client" />
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.message || error.error || 'Request failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    return handleResponse<T>(response);
  } catch (error: any) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        0, 
        `Cannot connect to server. Please make sure the backend server is running at ${API_BASE_URL.replace('/api', '')}`
      );
    }
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle other errors
    throw new ApiError(0, error.message || 'Network error occurred');
  }
}

export const api = {
  // Cleaners API
  cleaners: {
    getAll: async () => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners`);
    },

    getById: async (id: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners/${id}`);
    },

    create: async (cleaner: any) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleaner),
      });
    },

    update: async (id: string, updates: any) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
    },

    delete: async (id: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners/${id}`, {
        method: 'DELETE',
      });
    },

    getByStatus: async (status: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/cleaners/status/${status}`);
    },

    /** Bulk update verification status for multiple staff. Status: "Verified" | "Rejected" | "Pending" */
    bulkUpdateStatus: async (cleanerIds: string[], status: 'Verified' | 'Rejected' | 'Pending') => {
      return fetchWithErrorHandling<{ updatedCount: number; status: string }>(
        `${API_BASE_URL}/cleaners/bulk-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cleanerIds, status }),
        }
      );
    },

    /** WordPress-style bulk action: VERIFY | REJECT | PENDING */
    bulkAction: async (cleanerIds: string[], action: 'VERIFY' | 'REJECT' | 'PENDING') => {
      return fetchWithErrorHandling<{ updatedCount: number; status: string }>(
        `${API_BASE_URL}/cleaners/bulk-action`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, cleanerIds }),
        }
      );
    },

    bulkDelete: async (cleanerIds: string[]) => {
      return fetchWithErrorHandling<{ deletedCount: number }>(
        `${API_BASE_URL}/cleaners/bulk-delete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cleanerIds }),
        }
      );
    },

    /** Bulk update hourly pay, employment type, and/or location for selected staff */
    bulkUpdate: async (
      cleanerIds: string[],
      updates: { hourlyPayRate?: number; employmentType?: string; location?: string }
    ) => {
      return fetchWithErrorHandling<{ updatedCount: number; updatedFields: string[] }>(
        `${API_BASE_URL}/cleaners/bulk-update`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cleanerIds, ...updates }),
        }
      );
    },
  },

  // Documents API
  documents: {
    getByCleanerId: async (cleanerId: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/documents/cleaner/${cleanerId}`);
    },

    add: async (cleanerId: string, document: any) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/documents/cleaner/${cleanerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
    },

    update: async (cleanerId: string, documentId: string, updates: any) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/documents/cleaner/${cleanerId}/document/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
    },

    delete: async (cleanerId: string, documentId: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/documents/cleaner/${cleanerId}/document/${documentId}`, {
        method: 'DELETE',
      });
    },
  },

  // Invitations API
  invitations: {
    getAll: async () => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations`);
    },

    getByToken: async (inviteToken: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${inviteToken}`);
    },

    send: async (employeeName: string, email: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeName, email }),
      });
    },

    verifyOtp: async (inviteToken: string, otp: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteToken, otp }),
      });
    },

    verifyEmployeeToken: async (token: string, inviteToken: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboardingToken: token, inviteToken }),
      });
    },

    verifyToken: async (onboardingToken: string, inviteToken: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboardingToken, inviteToken }),
      });
    },

    resendOtp: async (invitationId: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${invitationId}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },

    complete: async (invitationId: string, onboardingProgress?: number) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${invitationId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboardingProgress }),
      });
    },

    delete: async (invitationId: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${invitationId}`, {
        method: 'DELETE',
      });
    },

    // Onboarding Progress API
    saveProgress: async (inviteToken: string, step: number, formData: any, isStepCompleted: boolean = false) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${inviteToken}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step, formData, isStepCompleted }),
      });
    },

    loadProgress: async (inviteToken: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${inviteToken}/progress`);
    },

    clearProgress: async (inviteToken: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/invitations/${inviteToken}/progress`, {
        method: 'DELETE',
      });
    },
  },

  // Admin API
  admin: {
    getProfile: async () => {
      return fetchWithErrorHandling(`${API_BASE_URL}/admin/profile`);
    },

    updateProfile: async (profile: any) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
    },
  },

  // Activity API
  activity: {
    getRecent: async (limit: number = 10) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/activity/recent?limit=${limit}`);
    },

    getAll: async (params?: { page?: number; limit?: number; actorRole?: string; actionType?: string; entityType?: string; entityId?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.actorRole) query.append('actorRole', params.actorRole);
      if (params?.actionType) query.append('actionType', params.actionType);
      if (params?.entityType) query.append('entityType', params.entityType);
      if (params?.entityId) query.append('entityId', params.entityId);
      return fetchWithErrorHandling(`${API_BASE_URL}/activity?${query.toString()}`);
    },

    getByEntity: async (entityType: string, entityId: string) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/activity/entity/${entityType}/${entityId}`);
    },
  },

  // Training API
  training: {
    sendExpiryReminder: async (params: { email: string; cleanerName: string; courseName: string; expiryDate: string }) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/training/send-expiry-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    },

    checkAndSendExpiryReminders: async (recordsWithEmail: Array<{ id: string; name: string; course: string; expiryDate: string; email: string }>) => {
      return fetchWithErrorHandling<{ success: boolean; sent: number }>(
        `${API_BASE_URL}/training/check-and-send-expiry-reminders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordsWithEmail }),
        }
      );
    },
  },

  // Risk & COSHH API
  riskCoshh: {
    riskAssessments: {
      getAll: () => fetchWithErrorHandling<import('../modules/risk-coshh/types').RiskAssessment[]>(`${API_BASE_URL}/risk-coshh/risk-assessments`),
      getById: (id: string) => fetchWithErrorHandling<import('../modules/risk-coshh/types').RiskAssessment>(`${API_BASE_URL}/risk-coshh/risk-assessments/${id}`),
      create: (data: Omit<import('../modules/risk-coshh/types').RiskAssessment, 'id'>) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').RiskAssessment>(`${API_BASE_URL}/risk-coshh/risk-assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: { hazards?: import('../modules/risk-coshh/types').Hazard[]; requiredPPE?: string[]; complianceRequirements?: import('../modules/risk-coshh/types').ComplianceRequirement[] }) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').RiskAssessment>(`${API_BASE_URL}/risk-coshh/risk-assessments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
      delete: (id: string) =>
        fetch(`${API_BASE_URL}/risk-coshh/risk-assessments/${id}`, { method: 'DELETE' }).then(r => {
          if (!r.ok) return r.json().then((err: { error?: string; message?: string }) => { throw new ApiError(r.status, err.message || err.error || 'Failed'); });
        }),
    },
    rams: {
      getAll: () => fetchWithErrorHandling<import('../modules/risk-coshh/types').RAMS[]>(`${API_BASE_URL}/risk-coshh/rams`),
      getById: (id: string) => fetchWithErrorHandling<import('../modules/risk-coshh/types').RAMS>(`${API_BASE_URL}/risk-coshh/rams/${id}`),
      create: (data: Omit<import('../modules/risk-coshh/types').RAMS, 'id'> & { documentData?: string }) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').RAMS>(`${API_BASE_URL}/risk-coshh/rams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: { documentData?: string; signedDocumentFileName?: string }) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').RAMS & { documentData?: string }>(`${API_BASE_URL}/risk-coshh/rams/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
      delete: (id: string) =>
        fetch(`${API_BASE_URL}/risk-coshh/rams/${id}`, { method: 'DELETE' }).then(r => {
          if (!r.ok) return r.json().then((err: { error?: string; message?: string }) => { throw new ApiError(r.status, err.message || err.error || 'Failed'); });
        }),
    },
    chemicals: {
      getAll: () => fetchWithErrorHandling<import('../modules/risk-coshh/types').Chemical[]>(`${API_BASE_URL}/risk-coshh/chemicals`),
      getById: (id: string) => fetchWithErrorHandling<import('../modules/risk-coshh/types').Chemical>(`${API_BASE_URL}/risk-coshh/chemicals/${id}`),
      create: (data: Omit<import('../modules/risk-coshh/types').Chemical, 'id'>) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').Chemical>(`${API_BASE_URL}/risk-coshh/chemicals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
    },
    sds: {
      getAll: () => fetchWithErrorHandling<import('../modules/risk-coshh/types').SDS[]>(`${API_BASE_URL}/risk-coshh/sds`),
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').SDS & { documentData?: string }>(`${API_BASE_URL}/risk-coshh/sds/${id}`),
      create: (data: Omit<import('../modules/risk-coshh/types').SDS, 'id'> & { documentData: string }) =>
        fetchWithErrorHandling<import('../modules/risk-coshh/types').SDS>(`${API_BASE_URL}/risk-coshh/sds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
    },
  },

  // Clients & Sites API
  clientsSites: {
    getClients: () => fetchWithErrorHandling<import('../modules/clients-sites/types').Client[]>(`${API_BASE_URL}/clients-sites/clients`),
    createClient: (data: Omit<import('../modules/clients-sites/types').Client, 'id'>) =>
      fetchWithErrorHandling<import('../modules/clients-sites/types').Client>(`${API_BASE_URL}/clients-sites/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    getSites: () => fetchWithErrorHandling<import('../modules/clients-sites/types').Site[]>(`${API_BASE_URL}/clients-sites/sites`),
    createSite: (data: Omit<import('../modules/clients-sites/types').Site, 'id'>) =>
      fetchWithErrorHandling<import('../modules/clients-sites/types').Site>(`${API_BASE_URL}/clients-sites/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateSite: (id: string, updates: { complianceDocuments?: import('../modules/clients-sites/types').SiteComplianceDocument[] }) =>
      fetchWithErrorHandling<import('../modules/clients-sites/types').Site>(`${API_BASE_URL}/clients-sites/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    getAssignments: () => fetchWithErrorHandling<import('../modules/clients-sites/types').WorkerAssignment[]>(`${API_BASE_URL}/clients-sites/assignments`),
    createAssignment: (data: Omit<import('../modules/clients-sites/types').WorkerAssignment, 'id'>) =>
      fetchWithErrorHandling<import('../modules/clients-sites/types').WorkerAssignment>(`${API_BASE_URL}/clients-sites/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    removeAssignment: (workerId: string, siteId: string) =>
      fetchWithErrorHandling<{ success: boolean }>(`${API_BASE_URL}/clients-sites/assignments?workerId=${encodeURIComponent(workerId)}&siteId=${encodeURIComponent(siteId)}`, {
        method: 'DELETE',
      }),
    deleteClient: (id: string) =>
      fetchWithErrorHandling<{ success: boolean }>(`${API_BASE_URL}/clients-sites/clients/${id}`, { method: 'DELETE' }),
    deleteSite: (id: string) =>
      fetchWithErrorHandling<{ success: boolean }>(`${API_BASE_URL}/clients-sites/sites/${id}`, { method: 'DELETE' }),
  },

  // Policy Documents API (document control)
  policyDocuments: {
    getAll: () => fetchWithErrorHandling(`${API_BASE_URL}/policy-documents`),
    getById: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/policy-documents/${id}`),
    create: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/policy-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/policy-documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
  },

  // Prospects API
  prospects: {
    getAll: () => fetchWithErrorHandling<import('../modules/prospect/types').Prospect[]>(`${API_BASE_URL}/prospects`),
    getById: (id: string) => fetchWithErrorHandling<import('../modules/prospect/types').Prospect>(`${API_BASE_URL}/prospects/${id}`),
    create: (data: Omit<import('../modules/prospect/types').Prospect, 'id' | 'createdAt'>) =>
      fetchWithErrorHandling<import('../modules/prospect/types').Prospect>(`${API_BASE_URL}/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: Partial<Omit<import('../modules/prospect/types').Prospect, 'id' | 'createdAt'>>) =>
      fetchWithErrorHandling<import('../modules/prospect/types').Prospect>(`${API_BASE_URL}/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      fetch(`${API_BASE_URL}/prospects/${id}`, { method: 'DELETE' }).then(r => {
        if (!r.ok) return r.json().then((err: { error?: string; message?: string }) => { throw new ApiError(r.status, err.message || err.error || 'Failed'); });
      }),
  },

  // Incidents API
  incidents: {
    getAll: () => fetchWithErrorHandling(`${API_BASE_URL}/incidents`),
    getById: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/incidents/${id}`),
    getActions: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/incidents/${id}/actions`),
    create: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    createAction: (incidentId: string, data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/incidents/${incidentId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateAction: (incidentId: string, actionId: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/incidents/${incidentId}/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      fetchWithErrorHandling<{ success: boolean }>(`${API_BASE_URL}/incidents/${id}`, { method: 'DELETE' }),
  },

  // User Access API
  users: {
    getAll: () => fetchWithErrorHandling(`${API_BASE_URL}/users`),
    getById: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/users/${id}`),
    create: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
  },

  // Training Records API
  trainingRecords: {
    getAll: () => fetchWithErrorHandling(`${API_BASE_URL}/training-records`),
    getById: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/training-records/${id}`),
    create: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/training-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/training-records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      fetchWithErrorHandling(`${API_BASE_URL}/training-records/${id}`, { method: 'DELETE' }),
  },

  // PPE Invoice API
  ppe: {
    getInvoices: async () => {
      return fetchWithErrorHandling<import('../types').PPEInvoiceRecord[]>(`${API_BASE_URL}/ppe/invoices`);
    },
    createInvoice: async (record: Omit<import('../types').PPEInvoiceRecord, 'id' | 'createdAt'>) => {
      return fetchWithErrorHandling<import('../types').PPEInvoiceRecord>(`${API_BASE_URL}/ppe/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    },
    updateInvoice: async (id: string, updates: Partial<Pick<import('../types').PPEInvoiceRecord, 'emailStatus'>>) => {
      return fetchWithErrorHandling<import('../types').PPEInvoiceRecord>(`${API_BASE_URL}/ppe/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    },
    sendInvoice: async (params: { email: string; clientName: string; invoiceFilename: string; invoiceBase64: string }) => {
      return fetchWithErrorHandling(`${API_BASE_URL}/ppe/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    },
    getRecords: () => fetchWithErrorHandling(`${API_BASE_URL}/ppe/records`),
    getRecordById: (id: string) => fetchWithErrorHandling(`${API_BASE_URL}/ppe/records/${id}`),
    createRecord: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateRecord: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    deleteRecord: (id: string) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/records/${id}`, { method: 'DELETE' }),
    getInventory: () => fetchWithErrorHandling(`${API_BASE_URL}/ppe/inventory`),
    createInventoryItem: (data: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateInventoryItem: (id: string, updates: any) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    deleteInventoryItem: (id: string) =>
      fetchWithErrorHandling(`${API_BASE_URL}/ppe/inventory/${id}`, { method: 'DELETE' }),
  },

  payslipSettings: {
    get: () =>
      fetchWithErrorHandling<{
        id: string;
        payType: 'Hourly' | 'Monthly';
        company: Record<string, unknown>;
        earningsRows: Array<{ description: string; hours: string; rate: string; amount: string }>;
        deductionsRows: Array<{ description: string; amount: string }>;
        leaveRows: Array<{ leaveType: string; entitled: string; used: string; balance: string }>;
        ytdSummary: Record<string, string>;
        notes: string;
      }>(`${API_BASE_URL}/payslip-settings`),
    update: (data: {
      payType?: 'Hourly' | 'Monthly';
      company?: Record<string, unknown>;
      earningsRows?: Array<{ description: string; hours: string; rate: string; amount: string }>;
      deductionsRows?: Array<{ description: string; amount: string }>;
      leaveRows?: Array<{ leaveType: string; entitled: string; used: string; balance: string }>;
      ytdSummary?: Record<string, string>;
      notes?: string;
    }) =>
      fetchWithErrorHandling<Record<string, unknown>>(`${API_BASE_URL}/payslip-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  invoiceSettings: {
    get: () =>
      fetchWithErrorHandling<{
        id: string;
        billBy: Record<string, unknown>;
        invoicePrefix: string;
        defaultVatPercent: number;
        defaultServiceCharges: number;
        defaultPaymentTermsDays: number;
        defaultNotes: string;
        defaultFooter: string;
        defaultServiceItems: Array<{
          serviceDescription: string;
          siteLocation: string;
          quantity: string;
          rate: string;
          discount: string;
          amount: string;
        }>;
        defaultServiceDetails: Record<string, string>;
      }>(`${API_BASE_URL}/invoice-settings`),
    update: (data: {
      billBy?: Record<string, unknown>;
      invoicePrefix?: string;
      defaultVatPercent?: number;
      defaultServiceCharges?: number;
      defaultPaymentTermsDays?: number;
      defaultNotes?: string;
      defaultFooter?: string;
      defaultServiceItems?: Array<{
        serviceDescription: string;
        siteLocation: string;
        quantity: string;
        rate: string;
        discount: string;
        amount: string;
      }>;
      defaultServiceDetails?: Record<string, string>;
    }) =>
      fetchWithErrorHandling<Record<string, unknown>>(`${API_BASE_URL}/invoice-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // Finance & Payroll API
  finance: {
    payroll: {
      getAll: (params?: { month?: number; year?: number; workerId?: string }) => {
        const q = new URLSearchParams();
        if (params?.month != null) q.append('month', params.month.toString());
        if (params?.year != null) q.append('year', params.year.toString());
        if (params?.workerId) q.append('workerId', params.workerId);
        const query = q.toString();
        return fetchWithErrorHandling<import('../modules/finance-payroll/types').PayrollRecord[]>(
          `${API_BASE_URL}/finance/payroll${query ? `?${query}` : ''}`
        );
      },
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').PayrollRecord>(`${API_BASE_URL}/finance/payroll/${id}`),
      create: (record: {
        workerId: string;
        workerName: string;
        month: number;
        year: number;
        payType?: 'Hourly' | 'Monthly';
        hoursWorked?: number;
        hourlyRate?: number;
        monthlySalary?: number | null;
        totalSalary: number;
        siteId?: string;
        siteName?: string;
        role?: string;
        paymentStatus?: 'Pending' | 'Paid';
        paymentDate?: string;
      }) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').PayrollRecord>(`${API_BASE_URL}/finance/payroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }),
      generate: (data: { month?: number; year?: number; workerOverrides?: Record<string, { hoursWorked?: number }> }) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').PayrollRecord[]>(`${API_BASE_URL}/finance/payroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: {
        payType?: 'Hourly' | 'Monthly';
        hoursWorked?: number;
        hourlyRate?: number;
        monthlySalary?: number | null;
        totalSalary?: number;
        month?: number;
        year?: number;
        paymentStatus?: 'Pending' | 'Paid';
        paymentDate?: string;
      }) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').PayrollRecord>(`${API_BASE_URL}/finance/payroll/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
      delete: (id: string) =>
        fetchWithErrorHandling<void>(`${API_BASE_URL}/finance/payroll/${id}`, { method: 'DELETE' }),
    },
    salarySlips: {
      getAll: (params?: { cleanerId?: string }) => {
        const q = new URLSearchParams();
        if (params?.cleanerId) q.append('cleanerId', params.cleanerId);
        const query = q.toString();
        return fetchWithErrorHandling<import('../modules/finance-payroll/types').SalarySlip[]>(
          `${API_BASE_URL}/finance/salary-slips${query ? `?${query}` : ''}`
        );
      },
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').SalarySlip>(`${API_BASE_URL}/finance/salary-slips/${id}`),
      getDownloadUrl: (id: string) => `${API_BASE_URL}/finance/salary-slips/${id}/download`,
      send: (id: string) =>
        fetchWithErrorHandling<{ success: boolean; message: string; to: string }>(
          `${API_BASE_URL}/finance/salary-slips/${id}/send`,
          { method: 'POST' }
        ),
    },
    invoices: {
      getAll: (params?: { status?: string; clientName?: string; year?: number }) => {
        const q = new URLSearchParams();
        if (params?.status) q.append('status', params.status);
        if (params?.clientName) q.append('clientName', params.clientName);
        if (params?.year != null) q.append('year', params.year.toString());
        const query = q.toString();
        return fetchWithErrorHandling<import('../modules/finance-payroll/types').Invoice[]>(
          `${API_BASE_URL}/finance/invoices${query ? `?${query}` : ''}`
        );
      },
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Invoice>(`${API_BASE_URL}/finance/invoices/${id}`),
      create: (data: Omit<import('../modules/finance-payroll/types').Invoice, 'id'>) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Invoice>(`${API_BASE_URL}/finance/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: Partial<import('../modules/finance-payroll/types').Invoice>) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Invoice>(`${API_BASE_URL}/finance/invoices/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
      delete: (id: string) =>
        fetchWithErrorHandling<void>(`${API_BASE_URL}/finance/invoices/${id}`, { method: 'DELETE' }),
      send: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Invoice>(
          `${API_BASE_URL}/finance/invoices/${id}/send`,
          { method: 'POST' }
        ),
    },
    siteContracts: {
      getAll: () =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').SiteContract[]>(`${API_BASE_URL}/finance/site-contracts`),
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').SiteContract>(`${API_BASE_URL}/finance/site-contracts/${id}`),
      create: (data: Omit<import('../modules/finance-payroll/types').SiteContract, 'id'>) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').SiteContract>(`${API_BASE_URL}/finance/site-contracts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: Partial<Pick<import('../modules/finance-payroll/types').SiteContract, 'contractValue' | 'billingPeriod' | 'paymentStatus' | 'lastBillingDate' | 'paymentDate' | 'paymentDocuments'>>) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').SiteContract>(`${API_BASE_URL}/finance/site-contracts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
    },
    quotations: {
      getAll: () =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Quotation[]>(`${API_BASE_URL}/finance/quotations`),
      getById: (id: string) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Quotation>(`${API_BASE_URL}/finance/quotations/${id}`),
      create: (data: Omit<import('../modules/finance-payroll/types').Quotation, 'id'> & { quotationNumber?: string }) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Quotation>(`${API_BASE_URL}/finance/quotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      update: (id: string, updates: Partial<Omit<import('../modules/finance-payroll/types').Quotation, 'id'>>) =>
        fetchWithErrorHandling<import('../modules/finance-payroll/types').Quotation>(`${API_BASE_URL}/finance/quotations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }),
      delete: (id: string) =>
        fetchWithErrorHandling<void>(`${API_BASE_URL}/finance/quotations/${id}`, { method: 'DELETE' }),
    },
  },
};

export { ApiError };
export default api;
