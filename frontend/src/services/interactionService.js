import api from "./api";

export const recordInteraction = async (propertyId, action) => {
    const response = await api.post("/api/interactions", {
        propertyId,
        action
    });
    return response.data;
};

export const getInteractions = async (action) => {
    const params = action ? { action } : {};
    const response = await api.get("/api/interactions", { params });
    return response.data.interactions;
};

export const removeInteraction = async (propertyId) => {
    const response = await api.delete(`/api/interactions/${propertyId}`);
    return response.data;
};
