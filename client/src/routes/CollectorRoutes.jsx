import { Navigate, Route }    from 'react-router-dom';
import CollectorGuard         from '../guards/CollectorGuard';
import CollectorLayout        from '../layouts/CollectorLayout';
import CollectorDashboard     from '../pages/collector/Dashboard';
import AssignedPickups        from '../pages/collector/AssignedPickups';
import CollectorProfile       from '../pages/collector/Profile';

export default function CollectorRoutes() {
  return (
    <Route path="/collector" element={<CollectorGuard />}>
      <Route element={<CollectorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CollectorDashboard />}                          />
        <Route path="assigned"  element={<AssignedPickups />}                             />
        <Route path="history"   element={<AssignedPickups defaultFilter="Completed" />}   />
        <Route path="profile"   element={<CollectorProfile />}                            />
      </Route>
    </Route>
  );
}