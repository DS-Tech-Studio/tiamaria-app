import type { OrderItem } from '../../../../types/order';
import { formatCurrency } from '../../../../types/order';

export function TotalLabel({ total }: { total: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
      <span className="text-sm font-semibold text-white/65">Total</span>
      <span className="text-lg font-bold text-caramelo">{formatCurrency(total)}</span>
    </div>
  );
}

export function TablaItemPedidos({ items }: { items: OrderItem[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[20rem] text-left text-xs">
        <thead className="border-b border-white/10 text-white/45">
          <tr>
            <th className="py-2 pr-2 font-medium">Producto</th>
            <th className="px-2 py-2 text-center font-medium">Cant.</th>
            <th className="py-2 pl-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item, index) => (
            <tr key={item.id ?? `${item.product_id}-${index}`}>
              <td className="py-2 pr-2 text-white">{item.product?.name ?? 'Producto eliminado'}</td>
              <td className="px-2 py-2 text-center text-white/65">{item.quantity}</td>
              <td className="py-2 pl-2 text-right font-semibold text-caramelo">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}