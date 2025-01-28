import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AuthUtils } from '../utils/auth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'student';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (requiredRole === 'teacher') {
          const isTeacher = await AuthUtils.isTeacher();
          setIsAuthorized(isTeacher);
          if (!isTeacher) {
            router.replace('/unauthorized');
          }
        } else if (requiredRole === 'student') {
          const isStudent = await AuthUtils.isStudent();
          setIsAuthorized(isStudent);
          if (!isStudent) {
            router.replace('/unauthorized');
          }
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        router.replace('/unauthorized');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : <LoadingSpinner />;
} 