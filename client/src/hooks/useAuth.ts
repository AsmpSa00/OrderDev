import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  restaurantId: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
