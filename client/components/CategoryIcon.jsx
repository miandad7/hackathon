import { Construction, Trash2, Droplets, Zap, CircleDot } from 'lucide-react';

export default function CategoryIcon({ category, className = "w-4 h-4" }) {
  switch (category) {
    case 'Road':
      return <Construction className={className} strokeWidth={1.75} />;
    case 'Garbage':
      return <Trash2 className={className} strokeWidth={1.75} />;
    case 'Water':
      return <Droplets className={className} strokeWidth={1.75} />;
    case 'Electricity':
      return <Zap className={className} strokeWidth={1.75} />;
    case 'Other':
    default:
      return <CircleDot className={className} strokeWidth={1.75} />;
  }
}
