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

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotifications();

  return (
    <div className="relative">
    <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-rojizo/80 text-caramelo transition-all hover:bg-rojizo hover:text-white hover:scale-105 active:scale-95 sm:h-11 sm:w-11"
          aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
          aria-expanded={isOpen}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:h-6 sm:w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-rojo border-2 border-profundo shadow-md" />
          )}
        </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-rojizo/60 bg-[#1a070b] p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold">Notificaciones</h3>
              {unreadCount > 0 && <span className="rounded-full bg-caramelo px-2 py-0.5 text-xs text-white">{unreadCount}</span>}
            </div>
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <button type="button" onClick={markAllAsRead} className="text-xs text-caramelo hover:underline">
                  Marcar leídas
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} className="text-lg leading-none text-white/50 hover:text-white" aria-label="Cerrar notificaciones">
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
                  className={`group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-all ${notification.isRead ? 'border-white/5 bg-profundo/40 opacity-70' : 'border-white/10 bg-profundo shadow-md'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getBadgeStyle(notification.type)}`}>
                      {notification.title}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-xs text-white/40 opacity-100 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{notification.clientName}</p>
                    <p className="text-xs text-white/70">{notification.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button type="button" onClick={clearAll} className="mt-3 w-full border-t border-white/10 pt-3 text-xs text-white/50 hover:text-caramelo">
              Eliminar todas
            </button>
          )}
        </div>
      )}
    </div>
  );
}