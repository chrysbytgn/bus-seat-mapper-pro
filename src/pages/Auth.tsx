import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

// Authentication now uses email directly

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    // Check if this is a password reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setIsResetPassword(true);
      setIsForgotPassword(false);
      setIsLogin(false);
    }
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada correctamente",
      });
      
      navigate("/");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Correo enviado!",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      
      setIsForgotPassword(false);
      setIsLogin(true);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login with email
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Error de acceso",
              description: "Correo o contraseña incorrectos",
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
        // Registration with email
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Usuario ya registrado",
              description: "Este correo ya está registrado. Intenta iniciar sesión.",
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
            {isResetPassword
              ? "Nueva Contraseña"
              : (isForgotPassword 
                ? "Recuperar Contraseña" 
                : (isLogin ? "Iniciar Sesión" : "Registrarse")
              )
            }
          </CardTitle>
          <CardDescription>
            {isResetPassword
              ? "Ingresa tu nueva contraseña"
              : (isForgotPassword
                ? "Te enviaremos un correo para restablecer tu contraseña"
                : (isLogin 
                  ? "Ingresa tus credenciales para acceder" 
                  : "Crea una cuenta para comenzar"
                )
              )
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isResetPassword ? handleResetPassword : (isForgotPassword ? handleForgotPassword : handleAuth)} className="space-y-4">
            {!isResetPassword && (
              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                />
              </div>
            )}
            {!isForgotPassword && (
              <>
                <div>
                  <label htmlFor="password" className="text-sm font-medium">
                    {isResetPassword ? "Nueva Contraseña" : "Contraseña"}
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>
                
                {isResetPassword && (
                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmar Contraseña
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                )}
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? "Cargando..." 
                : (isResetPassword
                  ? "Actualizar contraseña"
                  : (isForgotPassword 
                    ? "Enviar correo de recuperación" 
                    : (isLogin ? "Iniciar Sesión" : "Registrarse")
                  )
                )
              }
            </Button>
          </form>
          
          {!isResetPassword && (
            <div className="text-center mt-4 space-y-2">
              {isLogin && !isForgotPassword && (
                <Button
                  variant="link"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              )}
              
              <Button
                variant="link"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsLogin(!isLogin);
                }}
                className="text-sm block w-full"
              >
                {isForgotPassword
                  ? "Volver al inicio de sesión"
                  : (isLogin 
                    ? "¿No tienes cuenta? Regístrate" 
                    : "¿Ya tienes cuenta? Inicia sesión"
                  )
                }
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}