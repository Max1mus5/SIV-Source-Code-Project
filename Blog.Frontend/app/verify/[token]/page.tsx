'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerifyTokenProps {
  params: Promise<{ token: string }>;
}

export default function VerifyTokenPage({ params }: VerifyTokenProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Unwrap params Promise
    params.then(unwrappedParams => {
      setToken(unwrappedParams.token);
    });
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const verifyAccount = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/user/verify/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.responseType === 'success') {
          setStatus('success');
          setMessage(data.message || 'Tu cuenta ha sido verificada exitosamente.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'No se pudo verificar tu cuenta. El enlace puede haber expirado o ser inválido.');
        }
      } catch (error) {
        console.error('Error verifying account:', error);
        setStatus('error');
        setMessage('Ocurrió un error al verificar tu cuenta. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    verifyAccount();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Verificación de Cuenta</h1>
          <p className="text-muted-foreground">
            Estamos verificando tu cuenta...
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Verificando tu token de activación...
              </p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-600 dark:text-green-400">
                ¡Cuenta verificada!
              </AlertTitle>
              <AlertDescription className="text-green-600/90 dark:text-green-400/90">
                {message}
                <br />
                <span className="text-sm mt-2 block">
                  Serás redirigido al inicio de sesión en unos segundos...
                </span>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert className="border-red-500/50 bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-600 dark:text-red-400">
                  Error de verificación
                </AlertTitle>
                <AlertDescription className="text-red-600/90 dark:text-red-400/90">
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push('/register')} 
                  variant="outline"
                  className="w-full"
                >
                  Registrarse nuevamente
                </Button>
                <Button 
                  onClick={() => router.push('/')} 
                  variant="ghost"
                  className="w-full"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        {status === 'loading' && (
          <p className="text-xs text-center text-muted-foreground">
            Los enlaces de verificación expiran después de 24 horas
          </p>
        )}
      </div>
    </div>
  );
}
