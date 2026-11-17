import api from "./api";

export const saveProperty = async (propertyId) => {
    const response = await api.post("/api/saved", { propertyId });
    return response.data;
};

export const getSavedProperties = async () => {
    const response = await api.get("/api/saved");
    return response.data.saved;
};

export const getDueSavedReminder = async () => {
    const response = await api.get("/api/saved/reminders");
    return response.data;
};

export const dismissSavedReminder = async (propertyId) => {
    const response = await api.patch(`/api/saved/${propertyId}/reminder`);
    return response.data;
};

export const removeSavedProperty = async (propertyId) => {
    await api.delete(`/api/saved/${propertyId}`);
};
