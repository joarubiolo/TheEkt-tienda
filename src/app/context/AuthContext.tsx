import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "../services/firebase";
import {
  signInWithGoogle,
  logoutUser,
  onAuthStateChange,
} from "../services/firebase";
import { getProfile, createProfile, updateProfile } from "../services/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check if profile exists in Supabase
        const { data: existingProfile, error } = await getProfile(firebaseUser.uid);

        if (error || !existingProfile) {
          // Create new profile
          const { data: newProfile, error: createError } = await createProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            full_name: firebaseUser.displayName || "",
            avatar_url: firebaseUser.photoURL || null,
          });

          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        } else {
          setProfile(existingProfile);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const { user: firebaseUser, error } = await signInWithGoogle();

      if (error) {
        toast.error("Error al iniciar sesión: " + error);
        return;
      }

      if (firebaseUser) {
        toast.success("¡Bienvenido! Has iniciado sesión correctamente.");
      }
    } catch (err) {
      toast.error("Error inesperado al iniciar sesión");
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      const { error } = await logoutUser();

      if (error) {
        toast.error("Error al cerrar sesión");
        return;
      }

      toast.success("Has cerrado sesión correctamente");
    } catch (err) {
      toast.error("Error inesperado al cerrar sesión");
      console.error(err);
    }
  };

  const updateUserProfile = async (updates: any) => {
    if (!user) return;

    try {
      const { data, error } = await updateProfile(user.uid, updates);

      if (error) {
        toast.error("Error al actualizar perfil");
        return;
      }

      if (data) {
        setProfile(data);
        toast.success("Perfil actualizado correctamente");
      }
    } catch (err) {
      toast.error("Error al actualizar perfil");
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
