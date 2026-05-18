import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

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

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  // Public 
  { path: '/login',           element: <UserLogin />      },
  { path: '/register',        element: <UserRegister />   },
  { path: '/admin/login',     element: <AdminLogin />     },
  { path: '/collector/login', element: <CollectorLogin /> },

  // User portal 
  // Paths match UserLayout NAV exactly
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

  // Admin portal
  // Paths match AdminLayout NAV exactly
  {
    path: '/admin',
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

  // Collector portal 
  // Paths match CollectorLayout TABS exactly
  {
    path: '/collector',
    element: <CollectorLayout />,
    children: [
      { index: true,        element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: <CollectorDashboard /> },
      { path: 'assigned',   element: <AssignedPickups />    },
      { path: 'history',    element: <AssignedPickups />    },
      { path: 'profile',    element: <CollectorProfile />   },
    ],
  },

  //404
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