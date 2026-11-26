import apiClient from "../../../api/client";

const clean = (params) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

const get = async (url, params) => (await apiClient.get(`/website${url}`, { params: clean(params) })).data;
const post = async (url, body) => (await apiClient.post(`/website${url}`, body || {})).data;
const put = async (url, body) => (await apiClient.put(`/website${url}`, body || {})).data;
const del = async (url) => (await apiClient.delete(`/website${url}`)).data;

const section = ({ siteId, type }) => `/sites/${siteId}/content/${type}`;

export const websiteApi = {
  meta: () => get("/meta"),
  options: () => get("/options"),
  createSite: (body) => post("/sites", body),
  updateSite: ({ id, ...body }) => put(`/sites/${id}`, body),
  regenerateKey: (id) => post(`/sites/${id}/key`),
  counts: (siteId) => get(`/sites/${siteId}/counts`),

  list: ({ siteId, type, ...params }) => get(section({ siteId, type }), params),
  entry: ({ id, ...where }) => get(`${section(where)}/${id}`),
  createEntry: ({ data, ...where }) => post(section(where), { data }),
  updateEntry: ({ id, data, updatedAt, ...where }) => put(`${section(where)}/${id}`, { data, updatedAt }),
  deleteEntry: ({ id, ...where }) => del(`${section(where)}/${id}`),
  duplicateEntry: ({ id, ...where }) => post(`${section(where)}/${id}/duplicate`),
  reorder: ({ ids, ...where }) => put(`${section(where)}/order`, { ids }),
};

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

/** Uploads one image and returns its public address. */
export const uploadImage = async (siteId, file) => {
  if (file.size > 10 * 1024 * 1024) throw new Error("The image is larger than 10 MB");
  const form = new FormData();
  form.append("image", file);
  const res = await apiClient.post(`/website/sites/${siteId}/uploads`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

/** The address a website is given as its API base URL. */
export const publicSiteUrl = (siteKey) =>
  `${new URL(apiClient.defaults.baseURL, window.location.origin).href.replace(/\/$/, "")}/public/site/${siteKey}`;
