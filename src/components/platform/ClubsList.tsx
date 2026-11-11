import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pencil, Plus, Power, RotateCcw, Search, Settings2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { platformApi, PlatformClub } from '../../services/platformApi';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { ClubFormModal } from './ClubFormModal';

/** Clubes por página de la lista de la plataforma. */
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type ListStatus = 'loading' | 'ready' | 'error';

interface ClubsListProps {
  /** Búsqueda y página viven en la página, así vuelven como estaban al salir del detalle de un club. */
  query: string;
  onQueryChange: (query: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onManage: (club: PlatformClub) => void;
}

/** Lista de todos los clubes (activos y desactivados) con búsqueda por nombre, paginación, alta, edición y estado. */
export const ClubsList: React.FC<ClubsListProps> = ({ query, onQueryChange, page, onPageChange, onManage }) => {
  const { showToast } = useToast();

  const [clubs, setClubs] = useState<PlatformClub[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(0);

  // El texto del buscador se aplica 300 ms después de dejar de escribir, y vuelve a la página 1.
  const [searchText, setSearchText] = useState(query);
  useEffect(() => {
    if (searchText === query) return;
    const timer = setTimeout(() => onQueryChange(searchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, query, onQueryChange]);

  useEffect(() => {
    const seq = ++latest.current;
    setStatus('loading');
    platformApi
      .listClubs({ q: query, page, limit: PAGE_SIZE })
      .then((result) => {
        if (seq !== latest.current) return;
        setClubs(result.clubs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setStatus('ready');
      })
      .catch(() => {
        if (seq !== latest.current) return;
        setStatus('error');
      });
  }, [query, page, attempt]);

  // Si la página quedó fuera de rango (por ejemplo, tras una búsqueda), se vuelve a la última que existe.
  useEffect(() => {
    if (status === 'ready' && clubs.length === 0 && totalPages > 0 && page > totalPages) onPageChange(totalPages);
  }, [status, clubs.length, totalPages, page, onPageChange]);

  // null = formulario cerrado; 'new' = alta; un club = edición.
  const [formClub, setFormClub] = useState<PlatformClub | 'new' | null>(null);
  // Desactivar y reactivar piden confirmación; `confirmingId` es el club cuya confirmación está abierta.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSaved = (saved: PlatformClub, wasNew: boolean) => {
    setFormClub(null);
    if (wasNew) {
      // El club nuevo puede no estar en la página ni en la búsqueda actual: se vuelve a pedir la lista.
      setAttempt((n) => n + 1);
    } else {
      setClubs((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    }
  };

  const handleToggle = async (club: PlatformClub) => {
    if (togglingId) return;
    setTogglingId(club.id);
    try {
      const updated = await platformApi.updateClub(club.id, { active: !club.active });
      setClubs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setConfirmingId(null);
      showToast({
        title: updated.active ? 'Club reactivado' : 'Club desactivado',
        message: updated.active
          ? `«${updated.name}» vuelve a mostrarse en el sitio con sus canchas activas.`
          : `«${updated.name}» deja de mostrarse en el sitio. Sus canchas y sus admins se conservan.`,
        type: 'success',
      });
    } catch (err) {
      // La confirmación queda abierta para reintentar o cancelar.
      showToast({
        title: 'No pudimos cambiar el estado',
        message: err instanceof Error ? err.message : 'Probá de nuevo.',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Clubes</h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            {status === 'ready'
              ? `${total} ${total === 1 ? 'club' : 'clubes'}${query ? ' encontrados' : ''} · activos y desactivados`
              : 'Todos los clubes, activos y desactivados.'}
          </p>
        </div>
        <Button variant="volt" size="sm" className="w-full sm:w-auto" onClick={() => setFormClub('new')}>
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Nuevo club</span>
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar un club por nombre"
          aria-label="Buscar un club por nombre"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf"
        />
      </div>

      {status === 'error' ? (
        <div role="alert" className="p-8 rounded-xl bg-surface border border-line text-center space-y-4">
          <p className="text-sm text-ink">No pudimos cargar los clubes. Revisá tu conexión y probá de nuevo.</p>
          <Button variant="volt" size="sm" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Reintentar</span>
          </Button>
        </div>
      ) : status === 'loading' && clubs.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
          Cargando los clubes...
        </div>
      ) : clubs.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
          {query ? `No hay clubes con el nombre «${query}».` : 'Todavía no hay clubes. Creá el primero con «Nuevo club».'}
        </div>
      ) : (
        <>
        <div className={`hidden lg:block rounded-xl border border-line bg-surface overflow-x-auto overscroll-x-contain focus-within:ring-2 focus-within:ring-turf ${status === 'loading' ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
            <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Canchas activas</th>
                <th className="py-3 px-4 text-right">Admins</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clubs.map((club) => (
                <tr key={club.id} className={club.active ? '' : 'opacity-70'}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-ink">{club.name}</p>
                    <p className="font-mono text-[11px] text-ink-muted">{club.id}</p>
                    <p className="text-[11px] text-ink-muted">{club.zone}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        club.active ? 'bg-turf-soft text-turf-ink' : 'bg-surface-muted text-ink-muted'
                      }`}
                    >
                      {club.active ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{club.activeCourts}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{club.admins}</td>
                  <td className="py-3 px-4">
                    {confirmingId === club.id ? (
                      <div
                        role="alertdialog"
                        aria-label={`Confirmar ${club.active ? 'la desactivación' : 'la reactivación'} de ${club.name}`}
                        className="flex flex-wrap items-center justify-end gap-2"
                      >
                        <span className="text-xs text-ink max-w-[16rem] text-right">
                          {club.active
                            ? `¿Desactivar «${club.name}»? Deja de mostrarse en el sitio; sus canchas y sus admins se conservan.`
                            : `¿Reactivar «${club.name}»? Vuelve al sitio con sus canchas activas.`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(club)}
                          disabled={togglingId === club.id}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-turf bg-turf-soft text-xs font-semibold text-turf-ink hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{togglingId === club.id ? 'Guardando...' : club.active ? 'Desactivar' : 'Reactivar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={togglingId === club.id}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onManage(club)}
                          aria-label={`Gestionar canchas y admins de ${club.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-turf bg-turf-soft text-xs font-semibold text-turf-ink hover:opacity-90 transition-colors cursor-pointer"
                        >
                          <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Gestionar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormClub(club)}
                          aria-label={`Editar ${club.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(club.id)}
                          aria-label={`${club.active ? 'Desactivar' : 'Reactivar'} ${club.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{club.active ? 'Desactivar' : 'Reactivar'}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className={`lg:hidden divide-y divide-line rounded-xl border border-line bg-surface ${status === 'loading' ? 'opacity-60' : ''}`} aria-label="Clubes">
          {clubs.map((club) => (
            <li key={club.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink break-words">{club.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{club.zone}</p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-semibold ${
                    club.active ? 'bg-turf-soft text-turf-ink' : 'bg-surface-muted text-ink-muted'
                  }`}
                >
                  {club.active ? 'Activo' : 'Desactivado'}
                </span>
              </div>
              <details className="group">
                <summary className="min-h-11 flex items-center justify-between gap-2 text-xs font-semibold text-turf-ink cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf rounded">
                  Ver datos y acciones
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="pt-2 space-y-3">
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div className="min-w-0">
                      <dt className="text-ink-muted">ID</dt>
                      <dd className="font-mono text-ink break-all">{club.id}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Canchas activas</dt>
                      <dd className="font-mono tabular-nums text-ink">{club.activeCourts}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Admins</dt>
                      <dd className="font-mono tabular-nums text-ink">{club.admins}</dd>
                    </div>
                  </dl>
                  {confirmingId === club.id ? (
                    <div role="alertdialog" aria-label={`Confirmar ${club.active ? 'la desactivación' : 'la reactivación'} de ${club.name}`} className="space-y-2">
                      <p className="text-xs text-ink">
                        {club.active
                          ? `¿Desactivar «${club.name}»? Deja de mostrarse en el sitio; sus canchas y sus admins se conservan.`
                          : `¿Reactivar «${club.name}»? Vuelve al sitio con sus canchas activas.`}
                      </p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleToggle(club)} disabled={togglingId === club.id} className="min-h-11 px-3 rounded-lg border border-turf bg-turf-soft text-xs font-semibold text-turf-ink disabled:opacity-50">
                          {togglingId === club.id ? 'Guardando…' : club.active ? 'Desactivar' : 'Reactivar'}
                        </button>
                        <button type="button" onClick={() => setConfirmingId(null)} disabled={togglingId === club.id} className="min-h-11 px-3 rounded-lg border border-line text-xs font-semibold text-ink disabled:opacity-50">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => onManage(club)} aria-label={`Gestionar canchas y admins de ${club.name}`} className="min-h-11 px-3 rounded-lg border border-turf bg-turf-soft text-xs font-semibold text-turf-ink">Gestionar</button>
                      <button type="button" onClick={() => setFormClub(club)} aria-label={`Editar ${club.name}`} className="min-h-11 px-3 rounded-lg border border-line text-xs font-semibold text-ink">Editar</button>
                      <button type="button" onClick={() => setConfirmingId(club.id)} aria-label={`${club.active ? 'Desactivar' : 'Reactivar'} ${club.name}`} className="min-h-11 col-span-2 px-3 rounded-lg border border-line text-xs font-semibold text-ink">
                        {club.active ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} label="Páginas de clubes" />

      {formClub !== null && (
        <ClubFormModal
          club={formClub === 'new' ? null : formClub}
          onClose={() => setFormClub(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};
