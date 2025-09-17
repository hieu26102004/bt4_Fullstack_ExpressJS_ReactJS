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
	(error) => {
		// Handle authentication errors
		if (error.response?.status === 401) {
			const isViewedProductsAPI = error.config?.url?.includes('/viewed-products');
			const isFavoritesAPI = error.config?.url?.includes('/favorites');
			const isUserAPI = error.config?.url?.includes('/user');
			
			// Check for token outdated specifically
			if (error.response?.data?.code === "TOKEN_OUTDATED") {
				console.warn("Token outdated, user needs to login again");
				localStorage.clear();
				// Don't redirect immediately, let components handle it
				return Promise.reject({
					...error,
					tokenOutdated: true
				});
			}
			
			// For feature APIs that are not critical, just log the error
			if (isViewedProductsAPI || isFavoritesAPI) {
				console.warn("Feature API auth failed:", error.config?.url);
				return Promise.reject(error);
			}
			
			// For critical APIs like user info, handle appropriately
			if (isUserAPI) {
				console.warn("User API auth failed, clearing auth state");
				// Don't auto-redirect, let App.tsx handle it
				return Promise.reject(error);
			}
		}
		return Promise.reject(error);
	}
);

export default instance;
