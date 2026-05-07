import client from "./client";

/**
 * Social Media API Service
 */
export const schedulePost = async (postData) => {
    const response = await client.post('/social/posts', postData);
    return response.data;
};

export const getScheduledPosts = async (params) => {
    const response = await client.get('/social/posts', { params });
    return response.data;
};

export const deleteScheduledPost = async (id) => {
    const response = await client.delete(`/social/posts/${id}`);
    return response.data;
};

export const getPostInsights = async (id) => {
    const response = await client.get(`/social/posts/${id}/insights`);
    return response.data;
};

export const getPostComments = async (id) => {
    const response = await client.get(`/social/posts/${id}/comments`);
    return response.data;
};

export const replyToComment = async (commentId, message, isTopLevel = false) => {
    const response = await client.post(`/social/comments/${commentId}/replies`, { message, isTopLevel });
    return response.data;
};

export const likeComment = async (commentId) => {
    const response = await client.post(`/social/comments/${commentId}/like`);
    return response.data;
};

export const uploadSocialMedia = async (formData) => {
    const response = await client.post('/social/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getAudienceDemographics = async (instagramId) => {
    const response = await client.get(`/social/audience/${instagramId}`);
    return response.data;
};

export const getProfileInteractions = async (instagramId) => {
    const response = await client.get(`/social/interactions/${instagramId}`);
    return response.data;
};

export const getActiveStories = async (instagramId) => {
    const response = await client.get(`/social/stories/${instagramId}`);
    return response.data;
};

export const getMentionsAndTags = async (instagramId) => {
    const response = await client.get(`/social/mentions/${instagramId}`);
    return response.data;
};

export const searchHashtag = async ({ instagramId, keyword }) => {
    const response = await client.get(`/social/hashtag/${instagramId}`, { params: { keyword } });
    return response.data;
};
