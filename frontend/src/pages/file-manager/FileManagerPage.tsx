import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Folder, File, Upload, Plus, Trash2, ChevronRight, ArrowLeft, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatBytes, formatDate } from '../../utils/format';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
  extension: string;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentDir, setCurrentDir] = useState('');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const [directoryMode, setDirectoryMode] = useState(false);

  const fetchFiles = async (dir: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/files/list', { params: { dir } });
      setFiles(data.data || []);
    } catch { toast.error('Error al cargar archivos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(currentDir); }, [currentDir]);

  const handleNavigate = (path: string) => setCurrentDir(path);

  const handleBack = () => {
    const parts = currentDir.split('/').filter(Boolean);
    parts.pop();
    setCurrentDir(parts.join('/'));
  };

  const handleCreateDir = async () => {
    const name = prompt('Nombre del directorio:');
    if (!name) return;
    try {
      await api.post('/files/directory', { dir: currentDir, name });
      toast.success('Directorio creado');
      fetchFiles(currentDir);
    } catch { toast.error('Error al crear directorio'); }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      await api.delete('/files/delete', { params: { path } });
      toast.success('Eliminado');
      fetchFiles(currentDir);
    } catch { toast.error('Error al eliminar'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('files', file, (file as any).webkitRelativePath || file.name);
    }
    e.target.value = '';
    try {
      await api.post('/files/upload', formData);
      toast.success(`${files.length} archivo(s) subido(s)`);
      fetchFiles(currentDir);
    } catch (e: any) {
      console.error('Upload error:', e.response?.data || e.message);
      toast.error(e.response?.data?.error || 'Error al subir archivos');
    }
  };

  const getBasename = (p: string) => p.split(/[\\/]/).pop() || '';

  const handleUploadZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dest', currentDir || getBasename(file.name).replace('.zip', ''));
    try {
      await api.post('/files/upload-zip', formData);
      toast.success('ZIP subido y extraído');
      fetchFiles(currentDir);
    } catch (e: any) {
      console.error('ZIP upload error:', e.response?.data || e.message);
      toast.error(e.response?.data?.error || 'Error al procesar ZIP');
    }
  };

  const handleRead = async (path: string) => {
    try {
      const { data } = await api.get('/files/read', { params: { path } });
      setContent(data.data?.content || '');
      setEditing(path);
    } catch { toast.error('Error al leer archivo'); }
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await api.post('/files/write', { path: editing, content });
      toast.success('Archivo guardado');
      setEditing(null);
    } catch { toast.error('Error al guardar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Administrador de Archivos</h1>
          <p className="text-gray-400 mt-1">Gestiona los archivos de tu hosting</p>
        </div>
        <div className="flex gap-3">
          <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer">
            <Upload size={16} /> Subir
            <input type="file" className="hidden" multiple onChange={handleUpload} {...(directoryMode ? { webkitdirectory: '', directory: '' } as any : {})} />
          </label>
          <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer">
            <Archive size={16} /> ZIP
            <input type="file" className="hidden" accept=".zip" onChange={handleUploadZip} />
          </label>
          <button onClick={handleCreateDir} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Nueva carpeta
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <button onClick={() => setCurrentDir('')} className="hover:text-white">/</button>
        {currentDir.split('/').filter(Boolean).map((part, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={14} />
            <button onClick={() => setCurrentDir(arr.slice(0, i + 1).join('/'))} className="hover:text-white">{part}</button>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {currentDir && (
            <div className="card-hover flex items-center gap-3 cursor-pointer" onClick={handleBack}>
              <ArrowLeft size={18} className="text-gray-400" />
              <span className="text-gray-400">..</span>
            </div>
          )}
          {files.map((file) => (
            <div key={file.path} className="card-hover flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => file.type === 'directory' ? handleNavigate(file.path) : handleRead(file.path)}>
                {file.type === 'directory' ? (
                  <Folder size={20} className="text-primary-400" />
                ) : (
                  <File size={20} className="text-gray-400" />
                )}
                <div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.type === 'file' ? formatBytes(file.size) : ''} {formatDate(file.modifiedAt)}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(file.path)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1.5 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Editando: {editing}</h3>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary text-sm">Guardar</button>
              <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cerrar</button>
            </div>
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field min-h-[400px] font-mono text-sm" />
        </div>
      )}
    </div>
  );
}
