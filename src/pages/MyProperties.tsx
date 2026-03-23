import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile } from '../types';
import { toast } from 'sonner';
import { Home, PlusCircle, Edit2, Trash2, Eye, Loader2, Search, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

interface MyPropertiesProps {
  user: UserProfile | null;
}

export default function MyProperties({ user }: MyPropertiesProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchMyProperties = async () => {
      try {
        const q = query(
          collection(db, 'properties'),
          where('ownerUid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnap = await getDocs(q);
        setProperties(querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      } catch (error) {
        console.error('Error fetching my properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este anúncio?')) return;

    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Anúncio apagado com sucesso!');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Erro ao apagar anúncio.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Anúncios</h1>
          <p className="text-gray-500 font-medium">Gerencie os seus imóveis publicados</p>
        </div>
        <Link 
          to="/publicar" 
          className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Novo Anúncio</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">A carregar os seus anúncios...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(prop => (
            <div key={prop.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold shadow-sm",
                    prop.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {prop.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                  <p className="text-orange-600 font-bold">{formatCurrency(prop.price)}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <Link 
                    to={`/imovel/${prop.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Ver"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/editar/${prop.id}`}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Apagar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Home className="h-10 w-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Ainda não tem anúncios</h2>
            <p className="text-gray-500 max-w-md mx-auto">Comece a vender ou alugar os seus imóveis hoje mesmo na maior plataforma de Moçambique.</p>
          </div>
          <Link 
            to="/publicar" 
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Publicar Primeiro Anúncio</span>
          </Link>
        </div>
      )}
    </div>
  );
}
