import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/api/tenant-profile");
  return response.data;
};

export const saveProfile = async (profileData) => {
  const payload = { ...profileData };
  for (const key of ["age", "budgetMin", "budgetMax"]) {
    if (payload[key] === "" || payload[key] === null || payload[key] === undefined) delete payload[key];
    else payload[key] = Number(payload[key]);
  }
  if (payload.moveInDate === "") delete payload.moveInDate;
  const response = await api.put("/api/tenant-profile", payload);
  return response.data;
};
