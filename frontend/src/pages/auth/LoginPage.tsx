import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Key, LogIn, Copy, Check, ArrowLeft, ClipboardPaste } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'menu' | 'create' | 'use'>('menu');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { loginWithCode, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleCreateCode = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/create-code');
      setGeneratedCode(data.data.code);
      setMode('create');
    } catch (error: any) {
      console.error('Create code error:', error);
      const errData = error?.response?.data;
      const errMsg = errData?.error || error?.message || errData?.message || 'Error al generar código';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithCode(code.toUpperCase());
      toast.success('Acceso exitoso');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">CH</span>
            </div>
            <span className="text-white font-bold text-2xl">CloudHost</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {mode === 'menu' && 'Acceder'}
            {mode === 'create' && 'Código generado'}
            {mode === 'use' && 'Ingresar código'}
          </h1>
          <p className="text-gray-400 mt-2">
            {mode === 'menu' && 'Crea un código o usa uno existente'}
            {mode === 'create' && 'Guarda este código para acceder después'}
            {mode === 'use' && 'Escribe el código que te compartieron'}
          </p>
        </div>

        {mode === 'menu' && (
          <div className="card space-y-4">
            <button onClick={handleCreateCode} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <Key size={20} />
              {loading ? 'Generando...' : 'Crear código'}
            </button>
            <button onClick={() => setMode('use')} className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
              <LogIn size={20} />
              Usar código
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="card space-y-5">
            <div className="bg-dark-400 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-400 tracking-widest font-mono select-all">
                {generatedCode}
              </div>
            </div>
            <button onClick={copyCode} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <button onClick={() => { setMode('menu'); setGeneratedCode(''); }} className="btn-secondary w-full flex items-center justify-center gap-2 py-2 text-sm">
              <ArrowLeft size={16} />
              Volver
            </button>
          </div>
        )}

        {mode === 'use' && (
          <form onSubmit={handleUseCode} className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Código de acceso</label>
              <div className="relative">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-field text-center text-xl tracking-widest font-mono pr-10" placeholder="CH-XXXX-XXXX" required />
                <button type="button" onClick={async () => { const t = await navigator.clipboard.readText(); setCode(t.toUpperCase()); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all" title="Pegar">
                  <ClipboardPaste size={18} />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? 'Verificando...' : 'Acceder'}
              <LogIn size={18} />
            </button>
            <button type="button" onClick={() => setMode('menu')} className="btn-secondary w-full flex items-center justify-center gap-2 py-2 text-sm">
              <ArrowLeft size={16} />
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
