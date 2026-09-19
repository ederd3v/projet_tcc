"use client";

import { STATUS_PEDIDO, type StatusPedido } from "@/lib/status";
import { atualizarStatus } from "./actions";

export function StatusSelect({ pedidoId, status }: { pedidoId: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => atualizarStatus(pedidoId, e.target.value as StatusPedido)}
      className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-2 py-1 text-xs text-maruim-cream"
    >
      {STATUS_PEDIDO.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
