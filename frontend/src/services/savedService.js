import api from "./api";

export const saveProperty = async (propertyId) => {
    const response = await api.post("/api/saved", { propertyId });
    return response.data;
};

export const getSavedProperties = async () => {
    const response = await api.get("/api/saved");
    return response.data.saved;
};

export const removeSavedProperty = async (propertyId) => {
    await api.delete(`/api/saved/${propertyId}`);
};
