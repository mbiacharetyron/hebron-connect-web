// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hebronconnect.com/api/v1';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  code?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0);
  }
}

// Authentication API
export const authApi = {
  // Check if email and phone are available
  checkAvailability: async (data: { phone: string; email: string }) => {
    return request('/auth/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Send OTP for verification
  sendOtp: async (data: { identifier: string; type: 'phone' | 'email' }) => {
    return request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify OTP
  verifyOtp: async (data: {
    otp: string;
    identifier: string;
    type: 'phone' | 'email';
  }) => {
    return request<{ verification_token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Register new user
  register: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    identifier_type: 'phone' | 'email';
  }) => {
    return request<{
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (data: {
    login: string;
    password: string;
    device_token?: string;
    device_type?: string;
    device_id?: string;
    device_name?: string;
    device_model?: string;
    os_version?: string;
    app_version?: string;
    lang?: string;
  }) => {
    return request<{
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Logout
  logout: async () => {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  // Logout from all devices
  logoutAllDevices: async () => {
    return request<{ devices_logged_out: number }>('/auth/logout-all-devices', {
      method: 'POST',
    });
  },

  // Forgot password
  forgotPassword: async (data: { contact: string }) => {
    return request<{ contact: string; type: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reset password
  resetPassword: async (data: {
    contact: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }) => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Change password (authenticated)
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user profile
  getProfile: async () => {
    return request<{ user: any }>('/auth/profile', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data.data;
  },
};

// Subscription Plans API
export const subscriptionPlansApi = {
  // Get all subscription plans
  getAll: async () => {
    const response = await request<any>('/subscription-plans', {
      method: 'GET',
      requiresAuth: false, // Public endpoint
    });
    return {
      plans: response.plans || response.data?.plans || []
    };
  },

  // Get specific plan by ID
  getPlanById: async (planId: number) => {
    const response = await request<any>(`/subscription-plans/${planId}`, {
      method: 'GET',
      requiresAuth: false,
    });
    return {
      plan: response.plan || response.data?.plan || null
    };
  },

  // Get plan by slug
  getPlanBySlug: async (slug: string) => {
    const response = await request<any>(`/subscription-plans/slug/${slug}`, {
      method: 'GET',
      requiresAuth: false,
    });
    return {
      plan: response.plan || response.data?.plan || null
    };
  },

  // Get popular plans
  getPopularPlans: async () => {
    const response = await request<any>('/subscription-plans/popular', {
      method: 'GET',
      requiresAuth: false,
    });
    return {
      plans: response.plans || response.data?.plans || []
    };
  },
};

// Connect Rooms API
export const connectRoomsApi = {
  // Get user's connect rooms
  getMyRooms: async (params?: {
    search?: string;
    category_id?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const response = await request<any>(`/connect-rooms/my-rooms${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
    
    // Handle both response structures:
    // 1. { rooms: [], pagination: {} } - from documentation
    // 2. { data: [], current_page, etc } - actual API response
    if (response.data && Array.isArray(response.data)) {
      return {
        rooms: response.data,
        pagination: {
          total: response.total || 0,
          per_page: response.per_page || 10,
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          from: response.from || 0,
          to: response.to || 0,
        }
      };
    }
    
    // Fallback to documented structure
    return {
      rooms: response.rooms || [],
      pagination: response.pagination || {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      }
    };
  },

  // Get room feed
  getRoomFeed: async (roomId: number, type?: 'event' | 'announcement' | 'contribution') => {
    const queryParams = type ? `?type=${type}` : '';
    const response = await request<any>(`/connect-room/${roomId}/feed${queryParams}`, {
      method: 'GET',
    });
    
    // Return feed array, handling both possible response structures
    return {
      feed: response.feed || response.data || []
    };
  },

  // Get room members
  getRoomMembers: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/members`, {
      method: 'GET',
    });
    
    // The API returns members in the 'data' field after request() unwraps the response
    // response is already the inner data from the API
    return {
      members: Array.isArray(response) ? response : (response.members || response.data || [])
    };
  },
};

export { ApiError };
export type { ApiResponse };

