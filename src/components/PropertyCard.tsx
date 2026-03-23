import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Star } from 'lucide-react';
import { Property } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function PropertyCard({ property, isFavorite = false, onToggleFavorite }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeLabel = {
    venda: 'Venda',
    aluguel_mensal: 'Aluguel Mensal',
    aluguel_diario: 'Aluguel Diário',
  }[property.type];

  const typeColor = {
    venda: 'bg-blue-100 text-blue-700',
    aluguel_mensal: 'bg-green-100 text-green-700',
    aluguel_diario: 'bg-orange-100 text-orange-700',
  }[property.type];

  return (
    <motion.div 
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/imovel/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered ? "scale-110" : "scale-100"
          )}
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm", typeColor)}>
            {typeLabel}
          </span>
          {property.isFeatured && (
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-current" /> Destaque
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(property.id);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all",
            isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>

        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="text-white font-bold text-xl">
            {formatCurrency(property.price)}
            {property.type === 'aluguel_diario' && <span className="text-sm font-normal text-gray-300"> / noite</span>}
            {property.type === 'aluguel_mensal' && <span className="text-sm font-normal text-gray-300"> / mês</span>}
          </div>
        </div>
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider">
          <MapPin className="h-3 w-3 mr-1 text-orange-500" />
          {property.city}
        </div>
        
        <Link to={`/imovel/${property.id}`}>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-orange-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-gray-600 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1 text-gray-400" />
              <span>3</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1 text-gray-400" />
              <span>2</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1 text-gray-400" />
              <span>120m²</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
