import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Facturación</h1>
        <p className="text-gray-400 mt-1">Sin costos — todo es gratis</p>
      </div>
      <div className="card text-center py-16">
        <CreditCard size={64} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Todo es gratis</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          No hay cargos ni suscripciones. Disfruta de todos los servicios sin costo.
        </p>
      </div>
    </div>
  );
}
