import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile } from '../types';
import { toast } from 'sonner';
import { Camera, MapPin, Home, Building, LandPlot, Bed, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

const propertySchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres').max(100),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres'),
  price: z.number().min(1, 'O preço deve ser maior que zero'),
  type: z.enum(['venda', 'aluguel_mensal', 'aluguel_diario']),
  category: z.enum(['casa', 'quarto', 'terreno', 'escritorio']),
  city: z.string().min(1, 'Selecione uma cidade'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const CITIES = ['Maputo', 'Matola', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Pemba', 'Xai-Xai'];

interface PropertyFormProps {
  user: UserProfile | null;
  isEditing?: boolean;
}

export default function PropertyForm({ user, isEditing = false }: PropertyFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'venda',
      category: 'casa',
    }
  });

  useEffect(() => {
    if (!user) {
      toast.error('Faça login para publicar um anúncio.');
      navigate('/');
      return;
    }

    if (isEditing && id) {
      const fetchProperty = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'properties', id));
          if (docSnap.exists()) {
            const data = docSnap.data() as Property;
            if (data.ownerUid !== user.uid) {
              toast.error('Não tem permissão para editar este anúncio.');
              navigate('/');
              return;
            }
            setValue('title', data.title);
            setValue('description', data.description || '');
            setValue('price', data.price);
            setValue('type', data.type);
            setValue('category', data.category);
            setValue('city', data.city);
            setImages(data.images || []);
          }
        } catch (error) {
          console.error('Error fetching property:', error);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing, navigate, setValue, user]);

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) return;
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem.');
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        ...data,
        ownerUid: user.uid,
        images,
        status: 'active',
        updatedAt: serverTimestamp(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'properties', id), propertyData);
        toast.success('Anúncio atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'properties'), {
          ...propertyData,
          createdAt: serverTimestamp(),
          isFeatured: false,
        });
        toast.success('Anúncio publicado com sucesso!');
      }
      navigate('/meus-imoveis');
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Erro ao salvar anúncio.');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-600 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEditing ? 'Editar Anúncio' : 'Publicar Novo Anúncio'}
        </h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Home className="h-5 w-5 mr-2 text-orange-600" /> Informações Básicas
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Título do Anúncio</label>
              <input 
                {...register('title')}
                placeholder="Ex: Casa T3 na Sommerschield"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Tipo de Negócio</label>
                <select 
                  {...register('type')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="venda">Venda</option>
                  <option value="aluguel_mensal">Aluguel Mensal</option>
                  <option value="aluguel_diario">Aluguel Diário (Airbnb)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Categoria</label>
                <select 
                  {...register('category')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="casa">Casa</option>
                  <option value="quarto">Quarto</option>
                  <option value="terreno">Terreno</option>
                  <option value="escritorio">Escritório</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Preço (MZN)</label>
                <input 
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase">Cidade</label>
                <select 
                  {...register('city')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="">Selecione a cidade</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase">Descrição Detalhada</label>
              <textarea 
                {...register('description')}
                rows={6}
                placeholder="Descreva o imóvel, características, localização exata..."
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-orange-600" /> Fotos do Imóvel
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="URL da imagem (ex: https://...)"
                className="flex-grow p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button 
                type="button"
                onClick={addImage}
                className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs font-bold">Sem fotos</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading}
            className="flex-grow bg-orange-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
            {isEditing ? 'Salvar Alterações' : 'Publicar Anúncio'}
          </button>
        </div>
      </form>
    </div>
  );
}
