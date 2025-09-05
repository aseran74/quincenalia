import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'agency', label: 'Agencia' },
  { value: 'agent', label: 'Agente' },
  { value: 'owner', label: 'Propietario' },
  { value: 'interest', label: 'Interesado' },
];

export default function UserCreateForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    avatar_url: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) return '';
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatar_url = '';
      if (avatarFile) {
        avatar_url = await uploadAvatar();
      }
      // 1. Crear usuario en Auth
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: false, // No requiere confirmación
        user_metadata: { role: form.role },
      });
      if (userError) throw userError;
      const uid = userData.user.id;
      // 2. Crear perfil en profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: uid,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          profile_image: avatar_url,
          address: form.address,
        }]);
      if (profileError) throw profileError;
      toast({
        title: 'Éxito',
        description: 'Usuario y perfil creados correctamente',
      });
      setForm({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: '',
        avatar_url: '',
        address: '',
      });
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      toast({
        title: 'Error',
        description: error.message || JSON.stringify(error) || 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4">Crear nuevo usuario</h2>
      <div>
        <label className="block mb-1">Email</label>
        <Input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1">Contraseña</label>
        <Input name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1">Nombre</label>
        <Input name="first_name" value={form.first_name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1">Apellidos</label>
        <Input name="last_name" value={form.last_name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1">Teléfono</label>
        <Input name="phone" value={form.phone} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1">Dirección</label>
        <Input name="address" value={form.address} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1">Foto avatar</label>
        <Input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>
      <div>
        <label className="block mb-1">Rol</label>
        <Select value={form.role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(role => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading || !form.role}>
        {loading ? 'Creando...' : 'Crear usuario'}
      </Button>
    </form>
  );
} 