import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const simulateApiCall = (delay: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const mockUsers = [
  {
    id: "1",
    email: "admin@flowmaster.com",
    password: "password123",
    name: "Admin User",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "demo@example.com",
    password: "demo123",
    name: "Demo User",
    createdAt: new Date().toISOString(),
  },
];

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          await simulateApiCall(1500);

          const user = mockUsers.find(
            (u) => u.email === email && u.password === password
          );

          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              error: "Invalid email or password",
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: "Login failed. Please try again.",
            isLoading: false,
          });
          return false;
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          await simulateApiCall(1500);

          const existingUser = mockUsers.find((u) => u.email === email);

          if (existingUser) {
            set({
              error: "User with this email already exists",
              isLoading: false,
            });
            return false;
          }

          const newUser = {
            id: Date.now().toString(),
            email,
            password,
            name: email.split("@")[0],
            createdAt: new Date().toISOString(),
          };

          mockUsers.push(newUser);

          const { password: _, ...userWithoutPassword } = newUser;
          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            error: "Registration failed. Please try again.",
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
