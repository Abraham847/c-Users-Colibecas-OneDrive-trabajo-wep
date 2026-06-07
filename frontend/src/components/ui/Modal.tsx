import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={cn('w-full glass rounded-2xl shadow-2xl animate-scale-in', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
