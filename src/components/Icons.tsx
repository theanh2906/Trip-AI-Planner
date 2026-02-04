import React from 'react';
import { MapPin, Utensils, Camera, Bed, Coffee, Navigation } from 'lucide-react';
import { StopType } from '../types';

interface IconProps {
  type: StopType | 'DEFAULT';
  className?: string;
}

export const CategoryIcon: React.FC<IconProps> = ({ type, className }) => {
  const commonClass = className || 'w-5 h-5 text-white';

  switch (type) {
    case StopType.FOOD:
      return <Utensils className={commonClass} />;
    case StopType.SIGHTSEEING:
      return <MapPin className={commonClass} />;
    case StopType.PHOTO_OP:
      return <Camera className={commonClass} />;
    case StopType.HOTEL:
      return <Bed className={commonClass} />;
    case StopType.REST:
      return <Coffee className={commonClass} />;
    default:
      return <Navigation className={commonClass} />;
  }
};

export const getCategoryColor = (type: StopType) => {
  switch (type) {
    case StopType.FOOD:
      return 'bg-orange-500';
    case StopType.SIGHTSEEING:
      return 'bg-emerald-500';
    case StopType.PHOTO_OP:
      return 'bg-pink-500';
    case StopType.HOTEL:
      return 'bg-indigo-500';
    case StopType.REST:
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};
