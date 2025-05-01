import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '../components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const getDashboardPath = (role: string) => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'owner':
      return '/dashboard/owner';
    case 'agency':
      return '/dashboard/agencies';
    case 'agent':
      return '/dashboard/agents';
    case 'interested':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, loading, user } = useAuth();
  const { toast: useToastToast } = useToast();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      navigate(getDashboardPath(user.role));
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        await login(user);
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });

        navigate(getDashboardPath(profile?.role || 'user'));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al iniciar sesión.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await signup(signupData.email, signupData.password, signupData.name);
      if (success) {
        toast.success('¡Registro exitoso!');
      } else {
        toast.error('Error al registrarse. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      toast.error('Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Enlace enviado!",
        description: "Revisa tu correo electrónico para iniciar sesión.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al enviar el enlace.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AppLayout requireAuth={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Ingresa o regístrate para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Iniciar Sesión</CardTitle>
                    <CardDescription>
                      Ingresa tus credenciales para acceder a tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Contraseña"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Registrarse</CardTitle>
                    <CardDescription>
                      Crea una nueva cuenta para acceder
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Nombre"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Contraseña"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center text-muted-foreground mt-4">
              <p>Para demostración, puedes usar los siguientes usuarios:</p>
              <p className="mt-2"><strong>Admin:</strong> admin@example.com</p>
              <p><strong>Agencia:</strong> agency@example.com</p>
              <p><strong>Agente:</strong> agent@example.com</p>
              <p><strong>Propietario:</strong> owner@example.com</p>
              <p><strong>Interesado:</strong> interested@example.com</p>
              <p className="mt-2">Contraseña: <strong>password</strong> (para todos)</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Login;
