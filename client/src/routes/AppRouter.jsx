import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

import UserLayout      from '../layouts/UserLayout';
import AdminLayout     from '../layouts/AdminLayout';
import CollectorLayout from '../layouts/CollectorLayout';

import UserLogin      from '../pages/auth/UserLogin';
import UserRegister   from '../pages/auth/UserRegister';
import AdminLogin     from '../pages/auth/AdminLogin';
import CollectorLogin from '../pages/auth/CollectorLogin';

import UserDashboard  from '../pages/user/Dashboard';
import SchedulePickup from '../pages/user/SchedulePickups';
import MyPickups      from '../pages/user/MyPickups';
import Rewards        from '../pages/user/Rewards';
import Notifications  from '../pages/user/Notifications';
import Profile        from '../pages/user/Profile';

import AdminDashboard from '../pages/admin/Dashboard';
import PickupRequests from '../pages/admin/PickupRequest';
import Collectors     from '../pages/admin/Collectors';
import Users          from '../pages/admin/Users';

import CollectorDashboard from '../pages/collector/Dashboard';
import AssignedPickups    from '../pages/collector/AssignedPickups';
import CollectorProfile   from '../pages/collector/Profile';


function HydrationLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="w-8 h-8 rounded-full border-2 border-eco-500
        border-t-transparent animate-spin" />
    </div>
  );
}

function UserGuard() {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) return <HydrationLoader />;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== 'user') return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) return <HydrationLoader />;
  if (!user)               return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

function CollectorGuard() {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) return <HydrationLoader />;
  if (!user)                  return <Navigate to="/collector/login" replace />;
  if (user.role !== 'collector') return <Navigate to="/collector/login" replace />;
  return <Outlet />;
}
function PublicOnly({ children }) {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) return <HydrationLoader />;

  if (user) {
    if (user.role === 'admin')     return <Navigate to="/admin/dashboard"     replace />;
    if (user.role === 'collector') return <Navigate to="/collector/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  {
    path: '/login',
    element: <PublicOnly><UserLogin /></PublicOnly>,
  },
  {
    path: '/register',
    element: <PublicOnly><UserRegister /></PublicOnly>,
  },
  {
    path: '/admin/login',
    element: <PublicOnly><AdminLogin /></PublicOnly>,
  },
  {
    path: '/collector/login',
    element: <PublicOnly><CollectorLogin /></PublicOnly>,
  },

  {
    element: <UserGuard />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: '/dashboard',      element: <UserDashboard />  },
          { path: '/schedule',       element: <SchedulePickup /> },
          { path: '/pickups',        element: <MyPickups />      },
          { path: '/rewards',        element: <Rewards />        },
          { path: '/notifications',  element: <Notifications />  },
          { path: '/profile',        element: <Profile />        },
        ],
      },
    ],
  },

  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true,                 element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',           element: <AdminDashboard /> },
          { path: 'pickup-requests',     element: <PickupRequests /> },
          { path: 'pickup-requests/:id', element: <PickupRequests /> },
          { path: 'collectors',          element: <Collectors />     },
          { path: 'users',               element: <Users />          },
          { path: 'analytics',           element: <AdminDashboard /> },
        ],
      },
    ],
  },

  {
    path: '/collector',
    element: <CollectorGuard />,
    children: [
      {
        element: <CollectorLayout />,
        children: [
          { index: true,        element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',  element: <CollectorDashboard /> },
          { path: 'assigned',   element: <AssignedPickups />    },
          { path: 'history',    element: <AssignedPickups defaultFilter="Completed" /> },
          { path: 'profile',    element: <CollectorProfile />   },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="text-center">
          <p className="text-5xl font-bold text-ink-200">404</p>
          <p className="text-ink-500 mt-3 text-sm">Page not found</p>
        </div>
      </div>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}