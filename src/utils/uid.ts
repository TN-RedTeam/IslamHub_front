/**
 * Identifiant unique local — pour les clés React et les liaisons internes de
 * formulaire (segments, variantes, images…). Utilise l'API Web Crypto plutôt
 * que Math.random (CodeQL « insecure randomness ») ; ce n'est pas un secret,
 * mais on évite tout générateur non cryptographique par principe.
 */
export function uid(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (typeof crypto.getRandomValues === 'function') {
      const a = new Uint32Array(4);
      crypto.getRandomValues(a);
      return Array.from(a, (n) => n.toString(36)).join('');
    }
  }
  // Repli (environnements sans Web Crypto) — non cryptographique, mais sans Math.random.
  return `${Date.now().toString(36)}-${(globalThis.performance?.now() ?? 0).toString(36).replace('.', '')}`;
}

export default uid;
