import { Navigate, Route } from 'react-router-dom';
import AdminGuard     from '../guards/AdminGuard';
import AdminLayout    from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import PickupRequests from '../pages/admin/PickupRequests';
import Collectors     from '../pages/admin/Collectors';
import Users          from '../pages/admin/Users';

export default function AdminRoutes() {
  return (
    <Route path="/admin" element={<AdminGuard />}>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"       element={<AdminDashboard />} />
        <Route path="pickup-requests" element={<PickupRequests />} />
        <Route path="collectors"      element={<Collectors />}     />
        <Route path="users"           element={<Users />}          />
        <Route path="analytics"       element={<AdminDashboard />} />
      </Route>
    </Route>
  );
}
