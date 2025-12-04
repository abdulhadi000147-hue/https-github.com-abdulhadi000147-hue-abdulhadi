import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';
import { BookOpen, Calculator, Globe, Languages, Feather, Dna, Landmark } from 'lucide-react';

interface SubjectGridProps {
  onSelect: (subject: Subject) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'urdu': <Feather size={32} />,
  'english': <Languages size={32} />,
  'biology': <Dna size={32} />,
  'pak_studies': <Landmark size={32} />,
  'math': <Calculator size={32} />,
  'general': <BookOpen size={32} />
};

const SubjectGrid: React.FC<SubjectGridProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {SUBJECTS.map((sub) => {
        const fullSubject = { ...sub, icon: '' }; // Reconstruct full object if needed, mainly for type check
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(fullSubject as Subject)}
            className={`${sub.color} border-2 border-transparent hover:border-current transition-all duration-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center group shadow-sm hover:shadow-md h-40 hover:bg-opacity-40`}
          >
            <div className="p-3 bg-green-900 rounded-full group-hover:scale-110 transition-transform duration-200 text-white">
               {iconMap[sub.id] || <BookOpen size={32} />}
            </div>
            <span className="font-bold text-lg urdu-text">{sub.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SubjectGrid;