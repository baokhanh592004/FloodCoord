
import axiosClient from "../api/axiosClient";

export const importApi = {
  supply: {
    getTemplate: () =>
      axiosClient.get('/api/manager/supplies/template', {
        responseType: 'blob'
      }),

    importExcel: (file) => {
      const formData = new FormData();
      formData.append('file', file);

      return axiosClient.post('/api/manager/supplies/import', formData);
    }
  },

  vehicle: {
    getTemplate: () =>
      axiosClient.get('/api/manager/vehicles/template', {
        responseType: 'blob'
      }),

    importExcel: (file) => {
      const formData = new FormData();
      formData.append('file', file);

      return axiosClient.post('/api/manager/vehicles/import', formData);
    }
  },

  user: {
    getTemplate: () =>
      axiosClient.get('/api/admin/users/template', {
        responseType: 'blob'
      }),

    importExcel: (file) => {
      const formData = new FormData();
      formData.append('file', file);

      return axiosClient.post('/api/admin/users/import', formData);
    }
  }
};