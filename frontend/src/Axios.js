import axios from 'axios';

let baseURL = '';

const Axios = axios.create({
    baseURL: baseURL,
});

Axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (!error.response) {
            console.warn("Network Error or server did not respond", error);
        }
        else if (error?.response?.status === 404) {
            console.warn("404 error", error);
        }
        return Promise.reject(error);
    }
);

export default Axios;