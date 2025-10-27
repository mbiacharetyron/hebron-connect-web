// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.hebronconnect.com/api/v1';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  code?: number;
  error_code?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      // Check for session expiration
      if (response.status === 401 && data.error_code === 'SESSION_EXPIRED') {
        console.log("Session expired, redirecting to login");
        // Store current page to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/login' && currentPath !== '/register') {
          localStorage.setItem('redirect_after_login', currentPath);
        }
        // Clear token
        localStorage.removeItem('auth_token');
        // Redirect to login with reason
        window.location.href = '/login?reason=session_expired';
        throw new ApiError(
          data.message || 'Session expired',
          response.status,
          data.errors,
          data.error_code
        );
      }

      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors,
        data.error_code
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
    login_source?: 'browser' | 'web' | 'mobile';
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
      requiresAuth: false,
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
  getAll: async (roomId?: number) => {
    const queryParams = roomId ? `?room_id=${roomId}` : '';
    const response = await request<any>(`/subscription-plans${queryParams}`, {
      method: 'GET',
      requiresAuth: !!roomId, // Auth required if room_id is provided
    });
    return {
      plans: response.plans || response.data?.plans || [],
      converted_currency: response.converted_currency || response.data?.converted_currency || null
    };
  },

  // Get specific plan by ID
  getPlanById: async (planId: number, roomId?: number) => {
    const queryParams = roomId ? `?room_id=${roomId}` : '';
    const response = await request<any>(`/subscription-plans/${planId}${queryParams}`, {
      method: 'GET',
      requiresAuth: !!roomId,
    });
    return {
      plan: response.plan || response.data?.plan || null
    };
  },

  // Get plan by slug
  getPlanBySlug: async (slug: string, roomId?: number) => {
    const queryParams = roomId ? `?room_id=${roomId}` : '';
    const response = await request<any>(`/subscription-plans/slug/${slug}${queryParams}`, {
      method: 'GET',
      requiresAuth: !!roomId,
    });
    return {
      plan: response.plan || response.data?.plan || null
    };
  },

  // Get popular plans
  getPopularPlans: async (roomId?: number) => {
    const queryParams = roomId ? `?room_id=${roomId}` : '';
    const response = await request<any>(`/subscription-plans/popular${queryParams}`, {
      method: 'GET',
      requiresAuth: !!roomId,
    });
    return {
      plans: response.plans || response.data?.plans || []
    };
  },
};

// Subscription Management API
export const subscriptionApi = {
  // Create Stripe checkout session
  createCheckout: async (roomId: number, data: {
    plan_id: number;
    billing_cycle: 'monthly' | 'annual';
    success_url: string;
    cancel_url: string;
  }) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      session_id: response.session_id || response.data?.session_id,
      session_url: response.session_url || response.data?.session_url,
      expires_at: response.expires_at || response.data?.expires_at,
      plan_name: response.plan_name || response.data?.plan_name,
      billing_cycle: response.billing_cycle || response.data?.billing_cycle,
      amount: response.amount || response.data?.amount,
      currency: response.currency || response.data?.currency,
    };
  },

  // Get room subscription
  getSubscription: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription`, {
      method: 'GET',
    });
    return response;
  },

  // Update subscription (upgrade/downgrade/switch billing)
  updateSubscription: async (roomId: number, data: {
    new_plan_id?: number;
    new_billing_cycle?: 'monthly' | 'annual';
    proration_behavior?: 'create_prorations' | 'none';
  }) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Pause subscription
  pauseSubscription: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/pause`, {
      method: 'POST',
    });
    return response;
  },

  // Resume subscription
  resumeSubscription: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/resume`, {
      method: 'POST',
    });
    return response;
  },

  // Cancel subscription
  cancelSubscription: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/cancel`, {
      method: 'POST',
    });
    return response;
  },

  // Get payment methods
  getPaymentMethods: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/payment-methods`, {
      method: 'GET',
    });
    
    console.log("Raw payment methods API response:", response);
    
    // Handle multiple possible response structures
    const paymentMethods = response.payment_methods 
      || response.data?.payment_methods 
      || (Array.isArray(response.data) ? response.data : [])
      || (Array.isArray(response) ? response : []);
    
    const customerId = response.customer_id 
      || response.data?.customer_id 
      || response.stripe_customer_id
      || response.data?.stripe_customer_id;
    
    const defaultMethod = response.default_payment_method 
      || response.data?.default_payment_method
      || response.default_payment_method_id
      || response.data?.default_payment_method_id;
    
    console.log("Processed payment methods data:", {
      payment_methods: paymentMethods,
      customer_id: customerId,
      default_payment_method: defaultMethod,
    });
    
    return {
      payment_methods: paymentMethods,
      customer_id: customerId,
      default_payment_method: defaultMethod,
    };
  },

  // Create setup intent for adding payment method
  createSetupIntent: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/payment-methods/setup-intent`, {
      method: 'POST',
    });
    return {
      client_secret: response.client_secret || response.data?.client_secret,
      setup_intent_id: response.setup_intent_id || response.data?.setup_intent_id,
    };
  },

  // Set default payment method
  setDefaultPaymentMethod: async (roomId: number, paymentMethodId: string) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/payment-methods/${paymentMethodId}/set-default`, {
      method: 'POST',
    });
    return response;
  },

  // Get invoices
  getInvoices: async (roomId: number) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/invoices`, {
      method: 'GET',
    });
    console.log("Raw invoices API response:", response);
    
    // Handle multiple possible response structures
    const invoices = response.invoices
      || response.data?.invoices
      || (Array.isArray(response.data) ? response.data : [])
      || (Array.isArray(response) ? response : []);
    
    console.log("Processed invoices data:", invoices);
    
    return {
      invoices,
      room: response.room || response.data?.room,
      subscription: response.subscription || response.data?.subscription,
    };
  },

  // Get single invoice
  getInvoice: async (roomId: number, invoiceId: string) => {
    const response = await request<any>(`/connect-rooms/${roomId}/subscription/invoices/${invoiceId}`, {
      method: 'GET',
    });
    return response.invoice || response.data?.invoice || response;
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

