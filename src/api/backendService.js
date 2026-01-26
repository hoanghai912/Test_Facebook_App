import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const backendService = {
    savePageData: async (pageId, pageAccessToken) => {
        const response = await axios.post(`${BACKEND_API_URL}/facebook/addPageData`, {
            pageId,
            pageAccessToken
        });
        return response.data;
    }
};
