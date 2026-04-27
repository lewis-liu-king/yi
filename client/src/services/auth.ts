import api from './api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultAI: string;
    notifications: boolean;
  };
}

interface AuthResponse {
  token: string;
  user: User;
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return api.post('/auth/register', data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    return api.post('/auth/login', data);
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.user;
  },

  async updateUser(data: { username?: string; email?: string }): Promise<User> {
    const response = await api.put('/auth/update', data);
    return response.user;
  },

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ success: boolean }> {
    return api.post('/auth/change-password', data);
  }
};

export default authService;