'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2, Lock } from 'lucide-react';

interface ResetTokenProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetTokenProps) {
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Unwrap params Promise
    params.then(unwrappedParams => {
      setToken(unwrappedParams.token);
    });
  }, [params]);

  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/reset/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.responseType === 'success') {
        setStatus('success');
        setMessage(data.message || 'Tu contraseña ha sido actualizada exitosamente.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'No se pudo restablecer tu contraseña. El enlace puede haber expirado o ser inválido.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setStatus('error');
      setMessage('Ocurrió un error al restablecer tu contraseña. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Restablecer Contraseña</h1>
          <p className="text-muted-foreground">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border rounded-lg p-6 shadow-lg space-y-6">
          {status === 'success' ? (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-600 dark:text-green-400">
                ¡Contraseña actualizada!
              </AlertTitle>
              <AlertDescription className="text-green-600/90 dark:text-green-400/90">
                {message}
                <br />
                <span className="text-sm mt-2 block">
                  Serás redirigido al inicio de sesión en unos segundos...
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {status === 'error' && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <AlertTitle className="text-red-600 dark:text-red-400">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-red-600/90 dark:text-red-400/90">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {validationError && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <XCircle className="h-5 w-5 text-amber-500" />
                  <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={status === 'loading'}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                    disabled={status === 'loading'}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Alternative actions */}
          {status === 'error' && (
            <div className="pt-4 border-t space-y-2">
              <Button 
                onClick={() => router.push('/forgot-password')} 
                variant="outline"
                className="w-full"
              >
                Solicitar nuevo enlace
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="ghost"
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>
          )}
        </div>

        {/* Footer note */}
        {status === 'idle' && (
          <p className="text-xs text-center text-muted-foreground">
            Los enlaces de restablecimiento expiran después de 20 minutos
          </p>
        )}
      </div>
    </div>
  );
}
