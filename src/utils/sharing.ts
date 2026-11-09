/**
 * Utilidades para compartir partidos y jugadas de Canchas3.
 */

import { DEFAULT_SITE_NAME } from '../services/siteApi';

export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://canchas3.com.ar';
}

export function buildMatchShareUrl(matchId: string): string {
  return `${getBaseOrigin()}/partido/${encodeURIComponent(matchId)}`;
}

export function buildPlayShareUrl(playId: string): string {
  return `${getBaseOrigin()}/jugada/${encodeURIComponent(playId)}`;
}

export function buildWhatsAppMatchShareUrl(
  matchTitle: string,
  clubName: string,
  matchId: string,
  siteName: string = DEFAULT_SITE_NAME
): string {
  const url = buildMatchShareUrl(matchId);
  const text = `Mirá nuestro partido en ${siteName} (${clubName} · ${matchTitle}): ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppPlayShareUrl(
  playTitle: string,
  clubName: string,
  playId: string,
  timeFormatted: string,
  siteName: string = DEFAULT_SITE_NAME
): string {
  const url = buildPlayShareUrl(playId);
  const text = `Mirá esta jugada en ${siteName} (${clubName} · ${timeFormatted} hs - "${playTitle}"): ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Fallback to execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}
