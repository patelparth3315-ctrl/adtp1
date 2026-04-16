import api from "./api";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  image: string;
  readTime: string;
  hasVideo: boolean;
  status: "draft" | "published";
  createdAt: string;
}

export type BlogFormData = Omit<Blog, "_id" | "slug" | "createdAt">;

export const blogsService = {
  getAll: async () => {
    const res = await api.get("/blogs");
    return res.data.data.map((b: any) => ({ ...b, id: b._id }));
  },

  getOne: async (id: string) => {
    const res = await api.get(`/blogs/${id}`);
    return { ...res.data.data, id: res.data.data._id };
  },

  create: async (data: BlogFormData) => {
    const res = await api.post("/blogs", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<BlogFormData>) => {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/blogs/${id}`);
    return res.data;
  }
};
