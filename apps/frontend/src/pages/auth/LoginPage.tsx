import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import InputFlotante from '../../components/ui/InputFlotante';
import BotonSubmit from '../../components/ui/BotonSubmit';

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response;

    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data;

      if (typeof data === 'object' && data !== null && 'message' in data) {
        const message = data.message;
        return Array.isArray(message) ? message.join(', ') : String(message);
      }
    }
  }

  return 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { accessToken, user } = await loginRequest({ email, password });
      login(accessToken, {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
      });
      navigate('/home');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(213,118,66,0.18),_transparent_28%),linear-gradient(180deg,#f7f2ef_0%,#f4eae5_32%,#efe0d9_100%)] px-4 py-8 text-profundo sm:px-6">
      <section className="w-full max-w-[31rem] overflow-hidden rounded-[1.7rem] border border-[#eadbd3] bg-[#fffdfc] shadow-[0_24px_65px_rgba(36,1,3,0.09)] ring-1 ring-[#f0ddcf]">
        <div className="h-2 bg-[linear-gradient(90deg,#590209_0%,#752002_42%,#D57642_100%)]" aria-hidden="true" />
        <div className="px-6 pb-8 pt-10 sm:px-12 sm:pb-12 sm:pt-12">
          <div className="mb-8 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-[-18px] rounded-full bg-[conic-gradient(from_0deg,rgba(213,118,66,0.65),rgba(255,255,255,0.12),rgba(89,2,9,0.55),rgba(213,118,66,0.65))] opacity-90 blur-[2px] animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-[-10px] rounded-full border border-[#D57642]/40 bg-white/20 shadow-[0_0_28px_rgba(213,118,66,0.18)]" />
              <div className="relative rounded-full border-4 border-[#D57642]/20 bg-[#fff8f2] p-3 shadow-[0_12px_30px_rgba(213,118,66,0.14)]">
                <img className="h-24 w-24 object-contain sm:h-28 sm:w-28" src={logo} alt="Tía Mari Artesanal" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-caramelo">Panel interno</p>
            <h1 className="font-serif text-[clamp(2.15rem,10vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-profundo">Iniciar sesión</h1>
            <p className="mb-9 mt-4 text-[0.98rem] leading-[1.6] text-[#795f5e]">Ingresa tus datos para continuar.</p>
          </div>

          <form className="grid gap-[1.35rem]" onSubmit={handleSubmit}>
            <div>
              <InputFlotante
                label="Correo electrónico"
                id="email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                pattern="[^ @]+@[^ @]+"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <div className="relative">
                <InputFlotante
                  label="Contraseña"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-xs font-extrabold text-rojizo hover:text-caramelo"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {error && <p className="border-l-[3px] border-rojizo bg-[#fff0e9] px-3.5 py-2.5 text-[0.82rem] leading-[1.45] text-rojizo" role="alert">{error}</p>}

            <BotonSubmit isLoading={isSubmitting} loadingText="Entrando...">
              Entrar a mi cuenta
            </BotonSubmit>
          </form>

          <p className="mt-10 text-center text-xs text-[#a48c86]">Panel privado para el equipo Tiamari</p>
        </div>
      </section>
    </main>
  );
}
