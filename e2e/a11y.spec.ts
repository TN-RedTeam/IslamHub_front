import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Audit d'accessibilité automatisé (axe-core, règles WCAG 2 A & AA) sur les
// pages clés, en thème clair ET sombre. On échoue sur les violations
// « bloquantes » (impact serious/critical) ; les mineures sont seulement listées.

const PAGES: { name: string; path: string }[] = [
  { name: 'accueil', path: '/fr' },
  { name: 'croyance', path: '/fr/croyance' },
  { name: 'hadiths & paroles', path: '/fr/hadiths' },
  { name: 'recherche', path: '/fr/recherche' },
  { name: '404', path: '/fr/cette-page-nexiste-pas-xyz' },
];

const SCHEMES: ('light' | 'dark')[] = ['light', 'dark'];

for (const scheme of SCHEMES) {
  for (const { name, path } of PAGES) {
    test(`a11y — ${name} (${scheme})`, async ({ page }, testInfo) => {
      // Un seul projet suffit pour l'audit DOM (évite de doubler desktop+mobile).
      test.skip(testInfo.project.name !== 'desktop', 'audit axe sur un seul profil');

      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

      const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      const minor = results.violations.filter((v) => v.impact !== 'serious' && v.impact !== 'critical');
      if (minor.length) {
        console.log(`[a11y ${name}/${scheme}] mineures : ${minor.map((v) => v.id).join(', ')}`);
      }

      const detail = blocking.map((v) => `${v.id} (${v.impact}) × ${v.nodes.length} — ${v.help}`).join('\n');
      expect(blocking, `Violations a11y bloquantes :\n${detail}`).toEqual([]);
    });
  }
}
