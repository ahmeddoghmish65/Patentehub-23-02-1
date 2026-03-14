/**
 * textUtils.ts
 * Text direction, relative time, and mention/hashtag parsing utilities.
 */

/** Detect RTL for Arabic content, LTR otherwise. */
export function getTextDir(text: string): 'rtl' | 'ltr' {
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

/** Human-readable relative timestamp, bilingual (Arabic / Italian). */
export function relativeTime(iso: string, uiLang?: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const isIt = uiLang === 'it';
  if (mins < 1)  return isIt ? 'adesso' : 'الآن';
  if (mins < 60) return isIt ? `${mins} min fa` : `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isIt ? `${hours} h fa` : `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7)   return isIt ? `${days} giorni fa` : `منذ ${days} يوم`;
  return new Date(iso).toLocaleDateString(isIt ? 'it' : 'ar');
}

/**
 * Split text into plain segments, @mention tokens, and #hashtag tokens.
 * Used by MentionText to render highlighted interactive spans.
 */
export function parseTextTokens(
  text: string,
): Array<{ type: 'text' | 'mention' | 'hashtag'; value: string }> {
  const parts = text.split(/(#[\p{L}\p{N}_]+|@\w+)/gu);
  return parts.map(part => {
    if (part.startsWith('@') && part.length > 1) return { type: 'mention', value: part };
    if (part.startsWith('#') && part.length > 1) return { type: 'hashtag', value: part };
    return { type: 'text', value: part };
  });
}
