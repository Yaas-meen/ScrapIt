import ProtectedRoute from './ProtectedRoute';

export default function CollectorGuard(props) {
  return <ProtectedRoute allowedRoles={['collector']} loginPath="/collector/login" {...props} />;
}