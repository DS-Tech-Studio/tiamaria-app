import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem } from '../../types/notification.types';

function getBadgeStyle(type: NotificationItem['type']) {
  switch (type) {
    case 'NEW_ORDER':
      return 'bg-rojizo text-white';
    case 'ORDER_READY':
      return 'bg-caramelo text-profundo';
    case 'ORDER_CANCELLED':
      return 'bg-white/20 text-white';
    default:
      return 'bg-borgoña text-white';
  }
}

function formatTimeAgo(dateInput?: Date | string) {
  if (!dateInput) return 'hace un momento';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'ayer';
  return `hace ${diffInDays} d`;
}

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-rojizo/80 text-caramelo transition-all hover:scale-105 hover:bg-rojizo hover:text-white active:scale-95 sm:h-11 sm:w-11"
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        aria-expanded={isOpen}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-profundo bg-red-600 shadow-md" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-rojizo/60 bg-[#1a070b] p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button type="button" onClick={markAllAsRead} className="text-xs text-caramelo hover:underline">
                  Marcar leídas
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-lg leading-none text-white/50 hover:text-white"
                aria-label="Cerrar notificaciones"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-white/45">No hay notificaciones pendientes.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`group relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                    notification.isRead
                      ? 'border-white/5 bg-profundo/20 opacity-60'
                      : 'border-white/10 bg-profundo/80 shadow-md'
                  }`}
                >
                  {/* Punto indicador de lectura */}
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      notification.isRead ? 'bg-caramelo/30' : 'bg-red-600'
                    }`}
                  />

                  <div className="flex-1 space-y-1">
                    {/* Fila superior: Badge + Tiempo relativo */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getBadgeStyle(
                          notification.type
                        )}`}
                      >
                        {notification.title}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    {/* Nombre del Cliente */}
                    <p className="text-sm font-semibold text-white">
                      {notification.clientName || 'Cliente sin nombre'}
                    </p>

                    {/* Detalle o mensaje */}
                    <p className="text-xs text-caramelo/80">
                      {notification.message}
                    </p>
                  </div>

                  {/* Botón para eliminar en hover */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="text-sm leading-none text-white/30 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    aria-label="Eliminar notificación"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 w-full border-t border-white/10 pt-3 text-xs text-white/50 hover:text-caramelo"
            >
              Eliminar todas
            </button>
          )}
        </div>
      )}
    </div>
  );
}