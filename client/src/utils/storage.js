// Production-grade Storage Interface (Absolute URL for local Docker dev)
const API_URL = "http://localhost:5000/api/storage"; 

const storage = {
  get: async (key) => {
    try {
      const res = await fetch(`${API_URL}/${key}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Storage Get Error:", e);
      return { value: null };
    }
  },
  set: async (key, value) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (!res.ok) throw new Error("Save failed");
      return await res.json();
    } catch (e) {
      console.error("Storage Set Error:", e);
      return { success: false };
    }
  }
};

export default storage;
