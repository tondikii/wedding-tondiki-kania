import {data} from "../assets/data/data.js";

export const commentsService = {
  getComments: async function () {
    try {
      const response = await fetch(data.api);
      if (!response.ok) throw new Error("Network response was not ok");

      // Simpan hasil json ke variabel agar bisa di-log DAN di-return
      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Get error:", error);
      return {error: error.message, comments: []};
    }
  },

  addComments: async function (commentsData) {
    try {
      const response = await fetch(data.api, {
        method: "POST",
        // JANGAN gunakan no-cors jika ingin membaca balasan/response
        // Gunakan text/plain untuk menghindari masalah CORS Preflight di Apps Script
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(commentsData),
      });

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Post error:", error);
      return {error: error.message};
    }
  },
};
