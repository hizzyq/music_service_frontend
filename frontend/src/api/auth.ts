import { api } from './client';

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },
};