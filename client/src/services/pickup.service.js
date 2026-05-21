import { pickupApi } from '../api/pickupApi';

const pickupService = {
  createPickup:      (payload) => pickupApi.create(payload),
  getMyPickups:      (params)  => pickupApi.listMine(params),
  getAllPickups:      (params)  => pickupApi.listAll(params),
  getAssignedPickups:(params)  => pickupApi.listAssigned(params),
  getPickupById:     (id)      => pickupApi.getById(id),
  updateStatus:      (id, body)=> pickupApi.updateStatus(id, body),
  assignCollector:   (id, cId) => pickupApi.assignCollector(id, cId),
  deletePickup:      (id)      => pickupApi.remove(id),
};
export default pickupService;