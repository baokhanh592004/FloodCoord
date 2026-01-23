import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
}); 
export default axiosClient;
