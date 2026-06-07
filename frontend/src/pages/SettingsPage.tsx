import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, Key, Bell, Palette, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', company: user?.company || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  const handleUpdateProfile = async () => {
    try {
      await api.put('/admin/users/profile', form);
      toast.success('Perfil actualizado');
    } catch { toast.error('Error al actualizar'); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    try {
      await api.put('/auth/password', { currentPassword: passwordForm.current, newPassword: passwordForm.newPass });
      toast.success('Contraseña actualizada');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch { toast.error('Error al cambiar contraseña'); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-gray-400 mt-1">Configura tu cuenta y preferencias</p>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <User size={20} className="text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Perfil</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-300 mb-1">Nombre</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Email</label><input value={user?.email || ''} disabled className="input-field opacity-50" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Empresa</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Teléfono</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
        </div>
        <button onClick={handleUpdateProfile} className="btn-primary">Guardar cambios</button>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <Key size={20} className="text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Cambiar contraseña</h3>
        </div>
        <div className="space-y-4">
          <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="input-field" placeholder="Contraseña actual" />
          <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="input-field" placeholder="Nueva contraseña" />
          <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input-field" placeholder="Confirmar nueva contraseña" />
          <button onClick={handleChangePassword} className="btn-primary">Actualizar contraseña</button>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <Palette size={20} className="text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Preferencias</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-white">Notificaciones por correo</p><p className="text-xs text-gray-500">Recibe notificaciones de soporte y novedades</p></div>
            <label className="relative w-12 h-6 bg-white/10 rounded-full cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><span className="absolute inset-0 rounded-full peer-checked:bg-primary-500 transition-colors" /><span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform" /></label>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-white">Modo oscuro</p><p className="text-xs text-gray-500">Tema oscuro activado</p></div>
            <span className="text-primary-400 text-sm">Activado</span>
          </div>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Seguridad</h3>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="text-white">Autenticación de dos factores</p><p className="text-xs text-gray-500">Añade una capa extra de seguridad</p></div>
          <button className="btn-secondary text-sm">Activar</button>
        </div>
      </div>
    </div>
  );
}
