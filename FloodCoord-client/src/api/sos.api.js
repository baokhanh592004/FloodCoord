export const sosApi = {
  getAll: async () => {
    return Promise.resolve({
      data: [
        { id: 1, lat: 10.8, lng: 106.7, level: "HIGH" },
        { id: 2, lat: 10.81, lng: 106.72, level: "MEDIUM" },
      ],
    });
  },
};
