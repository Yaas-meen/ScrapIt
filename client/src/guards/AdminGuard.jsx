import ProtectedRoute from './ProtectedRoute';

export default function AdminGuard(props) {
  return <ProtectedRoute allowedRoles={['admin']} loginPath="/admin/login" {...props} />;
}