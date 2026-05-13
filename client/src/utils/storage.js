// Storage Shim to talk to our backend
const API_URL = "http://localhost:5000/api/storage";

const storage = {
  get: async (key) => {
    try {
      const res = await fetch(API_URL + "/" + key);
      return await res.json();
    } catch (e) {
      console.error("Storage Get Error:", e);
      return { value: null };
    }
  },
  set: async (key, value) => {
    try {
      await fetch(API_URL + "/" + key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
    } catch (e) {
      console.error("Storage Set Error:", e);
    }
  }
};

export default storage;
