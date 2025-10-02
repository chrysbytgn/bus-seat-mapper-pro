import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

// Utility functions for username/email mapping
const getEmailFromUsername = async (username: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('get_email_from_username', { 
    input_username: username 
  });
  
  if (error) {
    console.error('Error getting email from username:', error);
    return null;
  }
  
  return data;
};

const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('usernames')
    .select('username')
    .eq('username', username)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
  
  return !data;
};

const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (username.length < 3) {
    return { valid: false, error: 'El usuario debe tener al menos 3 caracteres' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'El usuario no puede tener más de 20 caracteres' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'El usuario solo puede contener letras, números y guiones bajos' };
  }
  return { valid: true };
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // For login, first get the email from username
        const email = await getEmailFromUsername(username);
        
        if (!email) {
          toast({
            title: "Error de acceso",
            description: "Usuario no encontrado",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Error de acceso",
              description: "Usuario o contraseña incorrectos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        navigate("/");
      } else {
        // Validate username format
        const validation = validateUsername(username);
        if (!validation.valid) {
          toast({
            title: "Usuario inválido",
            description: validation.error,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if username is available
        const available = await isUsernameAvailable(username);
        if (!available) {
          toast({
            title: "Usuario no disponible",
            description: "Este nombre de usuario ya está en uso. Por favor, elige otro.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // For registration, create email from username
        const email = `${username}@sistema.local`;
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: username
            }
          }
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Usuario ya registrado",
              description: "Este nombre de usuario ya está registrado. Intenta iniciar sesión.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        // The username mapping is now created automatically by the database trigger
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada correctamente. Iniciando sesión...",
        });

        // Auto-login after successful registration
        if (data.user) {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!loginError) {
            navigate("/");
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Ingresa tus credenciales para acceder" 
              : "Crea una cuenta para comenzar"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Nombre de Usuario
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="mi_usuario"
                minLength={3}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 3 caracteres, solo letras, números y guiones bajos
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cargando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin 
                ? "¿No tienes cuenta? Regístrate" 
                : "¿Ya tienes cuenta? Inicia sesión"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}