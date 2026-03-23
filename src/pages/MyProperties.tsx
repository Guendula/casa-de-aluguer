import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile } from '../types';
import { toast } from 'sonner';
import { Home, PlusCircle, Edit2, Trash2, Eye, Loader2, Search, AlertCircle, TrendingUp, Zap, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { updateDoc } from 'firebase/firestore';

interface MyPropertiesProps {
  user: UserProfile | null;
}

export default function MyProperties({ user }: MyPropertiesProps) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostingProp, setBoostingProp] = useState<Property | null>(null);
  const [isProcessingBoost, setIsProcessingBoost] = useState(false);

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

  const handleBoost = async () => {
    if (!boostingProp) return;
    
    setIsProcessingBoost(true);
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await updateDoc(doc(db, 'properties', boostingProp.id), {
        isBoosted: true,
        updatedAt: new Date()
      });
      
      setProperties(properties.map(p => 
        p.id === boostingProp.id ? { ...p, isBoosted: true } : p
      ));
      
      toast.success('Anúncio impulsionado com sucesso!');
      setBoostingProp(null);
    } catch (error) {
      console.error('Error boosting property:', error);
      toast.error('Erro ao impulsionar anúncio.');
    } finally {
      setIsProcessingBoost(false);
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
            <div key={prop.id} className={cn(
              "bg-white rounded-3xl shadow-sm border overflow-hidden group transition-all",
              prop.isBoosted ? "border-purple-200 shadow-purple-50" : "border-gray-100"
            )}>
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold shadow-sm",
                    prop.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {prop.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                  {prop.isBoosted && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                      <TrendingUp className="h-3 w-3 mr-1" /> Impulsionado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                  <p className="text-orange-600 font-bold">{formatCurrency(prop.price)}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/imovel/${prop.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
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

                  {!prop.isBoosted && (
                    <button 
                      onClick={() => setBoostingProp(prop)}
                      className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-200 transition-all"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Impulsionar</span>
                    </button>
                  )}
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

      {/* Boost Modal */}
      {boostingProp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Impulsionar Anúncio</h3>
              <button onClick={() => setBoostingProp(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-purple-50 p-6 rounded-2xl flex items-start space-x-4">
                <div className="bg-purple-600 p-3 rounded-xl text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-900">Visibilidade Máxima</h4>
                  <p className="text-sm text-purple-700">O seu anúncio aparecerá no topo das pesquisas e terá um selo exclusivo de destaque.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plano de Destaque (7 dias)</span>
                  <span className="font-bold text-gray-900">500,00 MZN</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total a pagar</span>
                  <span className="text-orange-600">500,00 MZN</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Pagar via M-Pesa / e-Mola</p>
                <div className="flex gap-2">
                  <div className="flex-grow bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center">
                    <span className="font-bold text-gray-700">+258 84 000 0000</span>
                  </div>
                  <button className="bg-gray-100 text-gray-400 px-4 rounded-xl font-bold text-xs uppercase">Alterar</button>
                </div>
              </div>

              <button 
                onClick={handleBoost}
                disabled={isProcessingBoost}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 flex items-center justify-center"
              >
                {isProcessingBoost ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processando...</>
                ) : (
                  'Confirmar Pagamento'
                )}
              </button>
              <p className="text-center text-xs text-gray-400">Ao confirmar, receberá um pedido de PIN no seu telemóvel.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
