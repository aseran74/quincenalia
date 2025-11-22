import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User as AppUser } from '../types/user';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para verificar si un ID es un UUID válido
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const createOrUpdateProfile = useCallback(async (userId: string, name: string, email: string, profileImage?: string) => {
    // Helper local para verificar UUID
    const isUUID = isValidUUID(userId);
    
    try {
      // Para usuarios de Firebase, buscar por auth_user_id en lugar de id
      // porque Firebase genera UIDs que no son UUIDs válidos
      const queryField = isUUID ? 'id' : 'auth_user_id';
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, auth_user_id')
        .eq(queryField, userId)
        .single();

      // Si hay un error al buscar y no es porque no existe, loguear el error
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('Error fetching profile (may not exist yet):', fetchError);
      }

      if (!existingProfile) {
        // Si no existe, crear un nuevo perfil con rol 'interested' para usuarios de Google
        // Generar un UUID para el id y usar auth_user_id para el UID de Firebase
        const profileData: any = {
          id: crypto.randomUUID(), // Generar UUID para el campo id (requerido)
          name: name || email.split('@')[0] || 'Usuario',
          role: 'interested' // Rol por defecto para usuarios que se autentican con Google
        };

        // Solo agregar auth_user_id si el userId no es un UUID válido (es un UID de Firebase)
        if (!isUUID) {
          profileData.auth_user_id = userId;
        } else {
          // Si es un UUID válido, usar el userId como id directamente
          profileData.id = userId;
        }

        // Solo agregar profile_image si existe
        if (profileImage) {
          profileData.profile_image = profileImage;
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Si el error es por auth_user_id siendo UUID, intentar sin ese campo
          if (insertError.message?.includes('uuid') || insertError.code === '22P02') {
            // Intentar crear sin auth_user_id si hay un problema de tipo
            const retryData = { ...profileData };
            delete retryData.auth_user_id;
            
            const { error: retryError } = await supabase
              .from('profiles')
              .insert([retryData]);
            
            if (retryError) {
              console.error('Error creating profile (retry):', retryError);
            }
          }
          // No lanzar el error, solo loguearlo para que no rompa el flujo de autenticación
          return;
        }
      } else {
        // Si existe, actualizar con la información más reciente de Google
        const updateData: any = {};
        
        if (name && name !== existingProfile.name) {
          updateData.name = name;
        }
        
        if (profileImage) {
          updateData.profile_image = profileImage;
        }

        // Solo actualizar si hay cambios
        if (Object.keys(updateData).length > 0) {
          const queryField = isUUID ? 'id' : 'auth_user_id';
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq(queryField, userId);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          }
        }
      }
    } catch (error: any) {
      console.error('Error in createOrUpdateProfile:', error);
      // No lanzar el error para que no rompa el flujo de autenticación
    }
  }, []);

  useEffect(() => {
    // Verificar si hay un usuario de Firebase primero
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      console.log('Firebase user found on mount:', firebaseUser.uid);
      // Si hay un usuario de Firebase, usar el listener de Firebase para manejarlo
      // No establecer loading en false aquí porque el listener lo hará
    } else {
      // Solo verificar Supabase si no hay usuario de Firebase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });
    }

    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        // Only clear if not logged in via Firebase (checked below)
        // But since we don't know order, we might need a more robust check.
        // For now, let's assume if Supabase is null, we wait for Firebase or check it.
        // Actually, let's let Firebase listener handle its part.
        if (!auth.currentUser) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Firebase Auth Listener
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Crear o actualizar el perfil en Supabase cuando alguien se autentica con Google
          await createOrUpdateProfile(
            firebaseUser.uid,
            firebaseUser.displayName || '',
            firebaseUser.email || '',
            firebaseUser.photoURL || undefined
          );

          // Esperar un poco para asegurar que el perfil se haya creado
          await new Promise(resolve => setTimeout(resolve, 500));

          // Intentar obtener el perfil de Supabase para obtener el rol correcto
          // Buscar por auth_user_id porque Firebase genera UIDs que no son UUIDs válidos
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, role, profile_image')
            .eq('auth_user_id', firebaseUser.uid)
            .single();

          if (profileData && !profileError) {
            const newUser: AppUser = {
              id: profileData.id,
              name: profileData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: profileData.role as AppUser['role'],
              profileImage: profileData.profile_image || firebaseUser.photoURL || undefined
            };
            console.log('Profile found, setting user:', newUser);
            setUser(newUser);
            setLoading(false);
          } else {
            // Fallback si no se puede obtener el perfil - usar datos de Firebase directamente
            console.warn('Profile not found, using Firebase data as fallback. Error:', profileError);
            const newUser: AppUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'interested', // Default role for Firebase users
              profileImage: firebaseUser.photoURL || undefined
            };
            console.log('Setting fallback user:', newUser);
            setUser(newUser);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in Firebase auth listener:', error);
          // Fallback si hay error - usar datos de Firebase directamente
          const newUser: AppUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'interested',
            profileImage: firebaseUser.photoURL || undefined
          };
          setUser(newUser);
          setLoading(false);
        }
      } else {
        // If Firebase is null, check if Supabase has a session (handled by its own listener usually)
        // If both are null, then user is null.
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user) {
            setUser(null);
            setLoading(false);
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFirebase();
    };
  }, [createOrUpdateProfile]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Determinar si es un UUID válido (Supabase) o un UID de Firebase
      const isUUID = isValidUUID(userId);
      const queryField = isUUID ? 'id' : 'auth_user_id';
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, profile_image')
        .eq(queryField, userId)
        .single();

      // Si el perfil no existe, intentar crearlo (solo para usuarios de Supabase con UUID válido)
      if (error && error.code === 'PGRST116' && isUUID) {
        // El perfil no existe, intentar crearlo
        const session = await supabase.auth.getSession();
        const email = session.data.session?.user.email || '';
        const displayName = session.data.session?.user.user_metadata?.full_name || 
                          session.data.session?.user.user_metadata?.name || 
                          email.split('@')[0] || 'Usuario';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            name: displayName,
            role: 'interested'
          }]);

        if (insertError) {
          console.error('Error creating profile on fetch:', insertError);
          // Si falla, usar datos básicos del usuario
          const fallbackUser: AppUser = {
            id: userId,
            name: displayName,
            email: email,
            role: 'interested',
            profileImage: undefined
          };
          setUser(fallbackUser);
          setLoading(false);
          return;
        }

        // Intentar obtener el perfil recién creado
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('id, name, role, profile_image')
          .eq('id', userId)
          .single();

        if (newProfile) {
          const userProfile: AppUser = {
            id: newProfile.id,
            name: newProfile.name || displayName,
            email: email,
            role: newProfile.role,
            profileImage: newProfile.profile_image || undefined
          };
          setUser(userProfile);
          setLoading(false);
          return;
        }
      }

      if (error) throw error;

      const userProfile: AppUser = {
        id: data.id,
        name: data.name || '',
        email: '',
        role: data.role,
        profileImage: data.profile_image || undefined
      };

      // Si es un owner, cargar sus puntos
      if (data.role === 'owner') {
        try {
          const { data: pointsData, error: pointsError } = await supabase
            .from('owner_points')
            .select('points')
            .eq('owner_id', userId)
            .single();

          if (!pointsError && pointsData) {
            (userProfile as any).points = pointsData.points || 0;
          } else {
            (userProfile as any).points = 0;
          }
        } catch (pointsError) {
          console.error('Error fetching owner points:', pointsError);
          (userProfile as any).points = 0;
        }
      }

      const session = await supabase.auth.getSession();
      userProfile.email = session.data.session?.user.email || '';

      setUser(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      if (!error) {
        await login(email, password);
      }

      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Crear o actualizar el perfil en Supabase automáticamente
      await createOrUpdateProfile(
        firebaseUser.uid,
        firebaseUser.displayName || '',
        firebaseUser.email || '',
        firebaseUser.photoURL || undefined
      );
      
      return true;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        signup,
        logout,
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
