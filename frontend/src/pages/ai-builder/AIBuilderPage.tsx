import { useState } from 'react';
import api from '../../services/api';
import { Bot, Sparkles, Loader, Globe, Code, Palette, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('moderno');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ html: string; pages: any[] } | null>(null);

  const styles = ['moderno', 'minimalista', 'oscuro', 'elegante', 'divertido', 'profesional', 'startup', 'tienda'];

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Describe el sitio web que deseas crear'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-website', { prompt, style });
      if (data.success) {
        setResult(data.data);
        toast.success('Sitio web generado exitosamente');
      }
    } catch {
      toast.error('Error al generar el sitio');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Website Builder</h1>
          <p className="text-gray-400 mt-1">Describe tu sitio web y la IA lo creará por ti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Describe tu sitio web</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field min-h-[150px] resize-none"
              placeholder="Ej: Quiero un sitio web moderno para una agencia de marketing digital con secciones de servicios, portafolio, equipo y contacto. Colores corporativos azul y blanco."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estilo visual</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${style === s ? 'gradient-bg text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader className="animate-spin" size={18} /> Generando sitio...</>
            ) : (
              <><Sparkles size={18} /> Generar sitio web</>
            )}
          </button>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Bot size={12} /> IA Generativa</span>
            <span className="flex items-center gap-1"><Globe size={12} /> Responsive</span>
            <span className="flex items-center gap-1"><Code size={12} /> HTML + CSS</span>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Vista previa</h3>
          {result ? (
            <div className="space-y-3">
              <div className="aspect-video bg-white rounded-xl overflow-hidden">
                <iframe srcDoc={result.html} className="w-full h-full" title="Preview" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result.html); toast.success('Código copiado'); }} className="btn-secondary text-sm flex items-center gap-2">
                  <Code size={14} /> Copiar código
                </button>
                <button className="btn-secondary text-sm flex items-center gap-2">
                  <Download size={14} /> Descargar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500">
              <Palette size={48} className="mb-4 text-gray-600" />
              <p>Describe tu sitio y genera una vista previa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
