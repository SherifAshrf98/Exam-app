export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: string;
  statusCode: number;
  message: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  statusCode: number;
  message: string;
} 