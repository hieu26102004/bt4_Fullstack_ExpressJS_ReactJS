import axios from 'axios';

const instance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
});

instance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);


instance.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error)
);

export default instance;
