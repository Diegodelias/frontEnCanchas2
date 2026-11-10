import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { ROUTES } from '../../routes/paths';
import { CityOption } from '../../types/canchas';
import { LoginAccessModal, type LoginView } from '../modals/LoginAccessModal';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandWordmark } from '../ui/BrandWordmark';
import { Button } from '../ui/Button';

/** Llamado a la acción de la barra: solo lo declaran las superficies públicas; los paneles no lo pasan. */
export interface AppHeaderCta {
  label: string;
  /** Label corto para pantallas muy angostas; si falta, se usa `label` en todos los tamaños. */
  compactLabel?: string;
  /** Ruta interna (Link) o acción (onClick), nunca ambas. */
  to?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

/** Link extra de sección (anchors de la landing, por ejemplo); `href` con '#' se renderiza como <a>. */
export interface AppHeaderSectionLink {
  label: string;
  href: string;
}

interface AppHeaderProps {
  cities?: CityOption[];
  selectedCityId?: string;
  onSelectCity?: (cityId: string) => void;
  sectionLinks?: AppHeaderSectionLink[];
  cta?: AppHeaderCta;
}

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-turf focus-visible:outline-offset-2';

/** La home es match exacto; el resto de las secciones matchea por prefijo para marcar rutas anidadas. */
function isSectionActive(pathname: string, path: string): boolean {
  if (path === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Patrón menu-button (APG) mínimo y sin dependencias: aria en el botón, cierre con Escape y con
 * pointer fuera, foco al primer ítem al abrir y retorno del foco al botón al cerrar por teclado.
 */
function useMenuButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    // Foco al primer ítem del menú al abrir.
    const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );
      if (items.length === 0) return;
      event.preventDefault();
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === 'ArrowDown'
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return { open, setOpen, close, buttonRef, menuRef };
}

/**
 * La barra del sitio: una sola implementación para la landing, las páginas de la app y los paneles.
 * Lo que varía entre superficies llega por props (selector de ciudad, links de sección, CTA).
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  cities,
  selectedCityId,
  onSelectCity,
  sectionLinks,
  cta,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authMode, user, activeRole, logout } = useAuth();
  const { name: siteName } = useSite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>('player');
  const accountMenu = useMenuButton();

  const showCitySelector = Boolean(cities && selectedCityId && onSelectCity);

  // Las guardias de /panel-club, /panel-plataforma y /perfil redirigen acá con
  // { openLogin: 'admin' | 'player' }: se abre el ingreso en esa vista y se limpia el estado,
  // para que volver atrás o recargar no lo vuelva a abrir.
  const openLoginRequest = (location.state as { openLogin?: string } | null)?.openLogin;
  useEffect(() => {
    if (openLoginRequest !== 'admin' && openLoginRequest !== 'player') return;
    setLoginView(openLoginRequest);
    setLoginModalOpen(true);
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: null }
    );
  }, [openLoginRequest, location.pathname, location.search, location.hash, navigate]);

  const handleOpenLogin = () => {
    setLoginView('player');
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (path: string) =>
    `inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 rounded-sm ${FOCUS_RING} ${
      isSectionActive(location.pathname, path) ? 'text-ink font-semibold' : 'hover:text-ink'
    }`;

  const rolePanel =
    activeRole === 'club_admin'
      ? { to: ROUTES.CLUB_ADMIN, label: 'Panel de Administración' }
      : activeRole === 'superadmin'
        ? { to: ROUTES.PLATFORM_ADMIN, label: 'Panel de la plataforma' }
        : null;

  const renderCta = (fullWidth: boolean) => {
    if (!cta) return null;
    const button = (
      <Button
        variant="volt"
        size="sm"
        fullWidth={fullWidth}
        onClick={cta.onClick}
        aria-label={cta.ariaLabel ?? cta.label}
        className={fullWidth ? '' : 'self-center'}
      >
        {cta.compactLabel ? (
          <>
            <span className="sm:hidden">{cta.compactLabel}</span>
            <span className="hidden sm:inline">{cta.label}</span>
          </>
        ) : (
          <span>{cta.label}</span>
        )}
      </Button>
    );
    return cta.to ? <Link to={cta.to}>{button}</Link> : button;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to={ROUTES.HOME}
            aria-label={`${siteName} Inicio`}
            className={`inline-flex items-center shrink-0 py-1 rounded-sm ${FOCUS_RING}`}
          >
            <BrandWordmark tone="light" />
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Navegación del sitio"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted"
          >
            <Link
              to={ROUTES.LIVE}
              aria-current={isSectionActive(location.pathname, ROUTES.LIVE) ? 'page' : undefined}
              className={navLinkClass(ROUTES.LIVE)}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span>En vivo</span>
            </Link>

            {sectionLinks?.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`inline-flex items-center transition-colors whitespace-nowrap shrink-0 py-1 rounded-sm hover:text-ink ${FOCUS_RING}`}
              >
                {item.label}
              </a>
            ))}

            {activeRole === 'player' && (
              <Link
                to={ROUTES.PROFILE}
                aria-current={isSectionActive(location.pathname, ROUTES.PROFILE) ? 'page' : undefined}
                className={navLinkClass(ROUTES.PROFILE)}
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Mi perfil</span>
              </Link>
            )}

            {rolePanel && (
              <Link
                to={rolePanel.to}
                aria-current={isSectionActive(location.pathname, rolePanel.to) ? 'page' : undefined}
                className={navLinkClass(rolePanel.to)}
              >
                <Building2 className="w-3.5 h-3.5 text-turf" aria-hidden="true" />
                <span>{rolePanel.label}</span>
              </Link>
            )}

            {showCitySelector && (
              <>
                <span className="h-4 w-px bg-line shrink-0" aria-hidden="true" />
                <div className="relative inline-flex items-center text-ink shrink-0">
                  <MapPin
                    className="w-4 h-4 text-turf pointer-events-none shrink-0"
                    aria-hidden="true"
                  />
                  <select
                    aria-label="Ciudad"
                    value={selectedCityId}
                    onChange={(e) => onSelectCity?.(e.target.value)}
                    className={`appearance-none bg-transparent pl-1.5 pr-6 py-1.5 text-sm font-semibold text-ink cursor-pointer whitespace-nowrap rounded-sm ${FOCUS_RING}`}
                  >
                    {cities!.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-ink-muted pointer-events-none -ml-4 shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </>
            )}
          </nav>

          {/* Zone 3: Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* If logged in: User Menu */}
            {authMode === 'registered' && user ? (
              <div className="relative hidden md:block">
                <button
                  ref={accountMenu.buttonRef}
                  type="button"
                  onClick={() => accountMenu.setOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={accountMenu.open}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-canvas hover:bg-surface-muted text-xs font-semibold text-ink transition-colors cursor-pointer self-center ${FOCUS_RING}`}
                >
                  <span className="w-6 h-6 rounded-md bg-pitch text-volt font-bold flex items-center justify-center text-[11px]">
                    {user.avatar || 'U'}
                  </span>
                  <span>{user.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] text-turf-ink bg-turf-soft px-1.5 py-0.5 rounded">
                    {user.roleLabel ?? (activeRole === 'club_admin' ? 'Administrador' : 'Jugador')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                </button>

                {accountMenu.open && (
                  <div
                    ref={accountMenu.menuRef}
                    role="menu"
                    aria-label="Cuenta"
                    className="absolute right-0 mt-1.5 w-56 rounded-xl bg-surface border border-line p-1.5 shadow-xl z-50 text-xs font-medium space-y-0.5 animate-dropdown-enter"
                  >
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <p className="font-bold text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-muted font-mono truncate">{user.email}</p>
                    </div>

                    {activeRole === 'player' && (
                      <Link
                        to={ROUTES.PROFILE}
                        role="menuitem"
                        onClick={() => accountMenu.close(false)}
                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-ink hover:bg-surface-muted transition-colors ${FOCUS_RING}`}
                      >
                        <User className="w-4 h-4 text-turf" aria-hidden="true" />
                        <span>Mi perfil y jugadas</span>
                      </Link>
                    )}

                    {rolePanel && (
                      <Link
                        to={rolePanel.to}
                        role="menuitem"
                        onClick={() => accountMenu.close(false)}
                        className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-ink hover:bg-surface-muted transition-colors ${FOCUS_RING}`}
                      >
                        <Building2 className="w-4 h-4 text-turf" aria-hidden="true" />
                        <span>{rolePanel.label}</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-line">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          logout();
                          accountMenu.close(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer ${FOCUS_RING}`}
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenLogin}
                className={`hidden md:inline-flex items-center justify-center h-10 px-3.5 text-sm font-semibold text-ink hover:text-turf transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer self-center rounded-lg ${FOCUS_RING}`}
              >
                Ingresar
              </button>
            )}

            {renderCta(false)}

            {/* Única instancia de ThemeToggle en el documento: siempre vive en la fila de la barra. */}
            <div className="theme-toggle-container flex items-center justify-center shrink-0 self-center my-auto sm:ml-0.5">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`md:hidden w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg border border-line text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0 self-center my-auto ${FOCUS_RING}`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="md:hidden border-t border-line bg-surface px-4 py-4 space-y-3"
          >
            {showCitySelector && (
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
                <label
                  htmlFor="mobile-city-select"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted"
                >
                  <MapPin className="w-3.5 h-3.5 text-turf" aria-hidden="true" />
                  <span>Ciudad</span>
                </label>
                <select
                  id="mobile-city-select"
                  value={selectedCityId}
                  onChange={(e) => {
                    onSelectCity?.(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-line-strong bg-canvas text-sm font-semibold text-ink"
                >
                  {cities!.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.region})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav aria-label="Navegación móvil" className="flex flex-col space-y-1">
              <Link
                to={ROUTES.LIVE}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isSectionActive(location.pathname, ROUTES.LIVE) ? 'page' : undefined}
                className={`min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf gap-2 rounded-sm ${FOCUS_RING}`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                <span>En vivo</span>
              </Link>

              {sectionLinks?.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf rounded-sm ${FOCUS_RING}`}
                >
                  {item.label}
                </a>
              ))}

              {activeRole === 'player' && (
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isSectionActive(location.pathname, ROUTES.PROFILE) ? 'page' : undefined}
                  className={`min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf rounded-sm ${FOCUS_RING}`}
                >
                  Mi perfil y jugadas
                </Link>
              )}

              {rolePanel && (
                <Link
                  to={rolePanel.to}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isSectionActive(location.pathname, rolePanel.to) ? 'page' : undefined}
                  className={`min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf gap-2 rounded-sm ${FOCUS_RING}`}
                >
                  <Building2 className="w-4 h-4 text-turf" aria-hidden="true" />
                  <span>{rolePanel.label}</span>
                </Link>
              )}
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              {cta && (
                <span onClick={() => setMobileMenuOpen(false)}>{renderCta(true)}</span>
              )}

              {authMode === 'registered' && user ? (
                <div className="p-3 rounded-xl bg-canvas border border-line flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink">
                    <p>{user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-11 inline-flex items-center px-2 text-xs text-red-500 hover:underline cursor-pointer rounded-lg ${FOCUS_RING}`}
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={handleOpenLogin}
                >
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Access Modal */}
      <LoginAccessModal
        isOpen={loginModalOpen}
        initialView={loginView}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
};
