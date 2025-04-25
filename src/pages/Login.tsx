
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '../components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido a Casa Comunitaria Digital",
        });
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Se ha enviado un correo de confirmación a tu email.",
      });
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message || "Ha ocurrido un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cargando..." : "Iniciar sesión"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="signup-name">Nombre</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cargando..." : "Registrarse"}
                    </Button>
                  </div>
                </form>
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
