import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, Camera, Loader2, Save, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';

interface ProfileProps {
  user: UserProfile | null;
}

export default function Profile({ user }: ProfileProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      setFormData({
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        updatedAt: serverTimestamp(),
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Sessão terminada.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao sair.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center space-y-6">
            <div className="relative inline-block">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName}
                className="h-32 w-32 rounded-full border-4 border-orange-100 mx-auto"
              />
              <button className="absolute bottom-1 right-1 bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition-all">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-500 font-medium">{user.email}</p>
            </div>
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider",
              user.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {user.isVerified ? (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Conta Verificada</>
              ) : (
                <><ShieldAlert className="h-4 w-4 mr-2" /> Não Verificada</>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-2">
            <button 
              onClick={() => navigate('/meus-imoveis')}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50 transition-all group"
            >
              <span className="font-bold text-gray-700">Meus Anúncios</span>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
            </button>
            <button 
              onClick={() => navigate('/favoritos')}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50 transition-all group"
            >
              <span className="font-bold text-gray-700">Favoritos</span>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
            </button>
            <hr className="my-2 border-gray-100" />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-all group text-red-600"
            >
              <span className="font-bold">Sair da Conta</span>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="flex-grow w-full">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Definições de Perfil</h1>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Email (Não editável)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl border border-gray-100 text-gray-500 cursor-not-allowed"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Telemóvel</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="+258 8X XXX XXXX"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-400">O seu número será usado para contactos de interessados.</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Save className="h-6 w-6 mr-2" />}
                Guardar Alterações
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
