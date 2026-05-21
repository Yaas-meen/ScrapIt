import { Route } from 'react-router-dom';
import UserGuard      from '../guards/UserGuard';
import UserLayout     from '../layouts/UserLayout';
import UserDashboard  from '../pages/user/Dashboard';
import SchedulePickup from '../pages/user/SchedulePickup';
import MyPickups      from '../pages/user/MyPickups';
import Rewards        from '../pages/user/Rewards';
import Notifications  from '../pages/user/Notifications';
import Profile        from '../pages/user/Profile';

export default function UserRoutes() {
  return (
    <Route element={<UserGuard />}>
      <Route element={<UserLayout />}>
        <Route path="/dashboard"     element={<UserDashboard />}  />
        <Route path="/schedule"      element={<SchedulePickup />} />
        <Route path="/pickups"       element={<MyPickups />}      />
        <Route path="/rewards"       element={<Rewards />}        />
        <Route path="/notifications" element={<Notifications />}  />
        <Route path="/profile"       element={<Profile />}        />
      </Route>
    </Route>
  );
}