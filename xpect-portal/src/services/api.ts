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
};

export { ApiError };
export default api;
