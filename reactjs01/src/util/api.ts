import axios from './axios.customize';

export const createUserApi = (name: string, email: string, password: string) => {
  const URL_API = "/api/v1/register";
  const data = { name, email, password };
  return axios.post(URL_API, data);
};

export const loginApi = (email: string, password: string) => {
  const URL_API = "/api/v1/login";
  const data = { email, password };
  return axios.post(URL_API, data);
};

export const getUserApi = () => {
  const URL_API = "/api/v1/user";
  return axios.get(URL_API);
};

export const getApiUrl = () => {
  return "/api/v1";
};

export const forgotPasswordApi = (email: string) => {
  const URL_API = "/api/v1/forgot-password";
  return axios.post(URL_API, { email });
};

export const resetPasswordApi = (email: string, otp: string, newPassword: string) => {
  const URL_API = "/api/v1/reset-password";
  return axios.post(URL_API, { email, otp, newPassword });
};