import axios from 'axios';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v21.0';

const facebookApi = axios.create({
  baseURL: FACEBOOK_API_URL,
});

export const facebookService = {
  getAccounts: async (accessToken) => {
    const response = await facebookApi.get(`/me/accounts`, {
      params: { access_token: accessToken, fields: 'name,id,access_token' }
    });
    return response.data;
  },

  getConversations: async (pageId, accessToken) => {
    const response = await facebookApi.get(`/${pageId}/conversations`, {
      params: {
        access_token: accessToken,
        fields: 'participants,link,message_count,unread_count,can_reply',
        limit: 50
      }
    });
    return response.data;
  },

  getCustomLabels: async (userId, accessToken) => {
    try {
      const response = await facebookApi.get(`/${userId}/custom_labels`, {
        params: { fields: 'page_label_name', access_token: accessToken }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching custom labels', error);
      return [];
    }
  },

  getLastMessage: async (conversationId, accessToken) => {
    try {
      const response = await facebookApi.get(`/${conversationId}/messages`, {
        params: { access_token: accessToken, fields: 'message,from,created_time', limit: 1 }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching last message', error);
      return [];
    }
  },

  getLongLivedAccessToken: async (userAccessToken, appId, appSecret) => {
    const response = await facebookApi.get(`/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: userAccessToken
      }
    });
    return response.data.access_token;
  },

  deleteLabel: async (labelId, userId, accessToken) => {
    const response = await facebookApi.delete(`/${labelId}/label`, {
      params: { user: userId, access_token: accessToken }
    });
    return response.data;
  },

  createCustomLabel: async (name, accessToken) => {
    const response = await facebookApi.post(`/me/custom_labels`, {
      page_label_name: name
    }, {
      params: { access_token: accessToken }
    });
    return response.data.id;
  },

  addLabelToUser: async (labelId, userId, accessToken) => {
    const response = await facebookApi.post(`/${labelId}/label`, {
      user: userId
    }, {
      params: { access_token: accessToken }
    });
    return response.data;
  },

  getPageDetails: async (accessToken) => {
    const response = await facebookApi.get(`/me`, {
      params: {
        fields: 'name,id,website,phone,emails,contact_address,access_token',
        access_token: accessToken
      }
    });
    return response.data;
  },

  updatePageDetails: async (accessToken, data) => {
    const response = await facebookApi.post(`/me`, data, {
      params: { access_token: accessToken }
    });
    return response.data;
  },

  sendMessage: async (recipientId, text, accessToken) => {
    const response = await facebookApi.post(`/me/messages`, {
      messaging_type: "RESPONSE",
      recipient: { id: recipientId },
      message: { text: text }
    }, {
      params: { access_token: accessToken }
    });
    return response.data;
  },

  subscribeApp: async (pageId, accessToken) => {
    const response = await facebookApi.post(`/${pageId}/subscribed_apps`, {}, {
      params: { subscribed_fields: 'messages', access_token: accessToken }
    });
    return response.data;
  },

  unSubscribeApp: async (pageId) => {
    const response = await facebookApi.delete(`/${pageId}/subscribed_apps`, {
      params: { access_token: import.meta.env.VITE_FACEBOOK_APP_ID + '|' + import.meta.env.VITE_FACEBOOK_APP_SECRET }
    });
    return response.data;
  }
};
