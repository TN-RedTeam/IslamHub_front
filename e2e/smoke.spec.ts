import { test, expect } from '@playwright/test';

// Parcours critiques en « smoke » : l'app est servie sans Supabase et bascule sur
// les données locales bundlées. On vérifie que le shell, la navigation et les
// états d'erreur fonctionnent — pas le contenu exact (dépendant de la BDD).
// Locale forcée fr-FR (voir playwright.config) ; BrowserRouter comme en prod.

test('l’accueil se charge, titre + marque Ahl-Sunnah, sans erreur JS', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Ahl-Sunnah/);
  // La marque apparaît dans l'en-tête (texte latin du logotype).
  await expect(page.getByText('Ahl-Sunnah', { exact: false }).first()).toBeVisible();
  // Redirection locale : '/' → '/fr'.
  await expect(page).toHaveURL(/\/fr(\/|$)/);

  expect(errors, `erreurs JS non interceptées :\n${errors.join('\n')}`).toEqual([]);
});

test('une page inexistante affiche la 404 soignée', async ({ page }) => {
  await page.goto('/fr/cette-page-nexiste-pas-xyz');
  await expect(page.getByText(/Cette page n.existe pas/)).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
  // Lien de retour à l'accueil présent.
  await expect(page.getByRole('link', { name: /Retour à l.accueil/ })).toBeVisible();
});

test('desktop — navigation par la barre haute vers Croyance', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'barre haute masquée sur mobile');
  await page.goto('/');
  // Lien de la barre haute (ciblé par href, robuste aux libellés de langue).
  await page.locator('nav a[href$="/croyance"]').first().click();
  await expect(page).toHaveURL(/\/croyance/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('mobile — bottom-nav visible et FAB recherche fonctionnel', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'bottom-nav masquée sur desktop');
  await page.goto('/');
  // Le FAB recherche (lien vers /recherche) est la cible la plus stable.
  const fab = page.locator('a[href$="/recherche"]').last();
  await expect(fab).toBeVisible();
  await fab.click();
  await expect(page).toHaveURL(/\/recherche/);
});
