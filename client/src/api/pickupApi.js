import client from './axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const pickupApi = {
  create: ({ wasteItems, pickupDate, address, imageFile }) => {
    const fd = new FormData();
    fd.append('wasteItems', typeof wasteItems === 'string' ? wasteItems : JSON.stringify(wasteItems));
    fd.append('pickupDate', pickupDate);
    if (address) fd.append('address', address);
    if (imageFile) fd.append('image', imageFile);
    return client
      .post('/pickups', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(unwrap);
  },
  listMine: (params = {}) => client.get('/pickups/my', { params }).then(unwrap),
  remove: (id) => client.delete(`/pickups/${id}`),

  getById: (id) => client.get(`/pickups/${id}`).then(unwrap),

  listAll: (params = {}) => client.get('/pickups', { params }).then(unwrap),
  updateStatus: (id, body) => client.patch(`/pickups/${id}/status`, body).then(unwrap),
  assignCollector: (id, collectorId) =>
    client.patch(`/pickups/${id}/assign`, { collectorId }).then(unwrap),
  listAssigned: (params = {}) => client.get('/pickups/assigned', { params }).then(unwrap),
};
export default pickupApi;