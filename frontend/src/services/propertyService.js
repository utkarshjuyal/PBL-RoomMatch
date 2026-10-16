import api from "./api";

export const getRecommendations = async () => {
    const response = await api.get("/api/recommendations");
    return response.data.recommendations;
};

export const getProperty = async (id) => {
    const response = await api.get(`/api/properties/${id}`);
    return response.data.property;
};

export const getMyProperties = async () => {
    const response = await api.get("/api/properties/mine");
    return response.data.properties;
};

export const createProperty = async (data) => {
    const response = await api.post("/api/properties", data);
    return response.data.property;
};

export const updateProperty = async (id, data) => {
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data.property;
};

export const deleteProperty = async (id) => {
    await api.delete(`/api/properties/${id}`);
};

export const uploadPropertyImages = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await api.post("/api/properties/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
    });
    return response.data.images;
};
