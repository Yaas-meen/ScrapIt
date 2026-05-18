import ProtectedRoute from './ProtectedRoute';

export default function UserGuard(props) {
  return <ProtectedRoute allowedRoles={['user']} loginPath="/login" {...props} />;
}
