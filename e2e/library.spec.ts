import { expect, test } from '@playwright/test';

test('real library workflow, conflicts, URL state, health and responsive layout', async ({
  page,
  request,
}) => {
  let prefix = `Browser check ${Date.now()}`;
  let authorId: number | undefined;
  let bookId: number | undefined;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('/authors');
    await page.getByRole('button', { name: 'Add author', exact: true }).click();
    await page.getByLabel('Author name').fill(prefix);
    const [createdAuthor] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/v1/authors') && r.request().method() === 'POST',
      ),
      page.getByRole('dialog').getByRole('button', { name: 'Add author', exact: true }).click(),
    ]);
    expect(createdAuthor.status()).toBe(201);
    authorId = (await createdAuthor.json()).id;
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('button', { name: `Rename ${prefix}`, exact: true }).click();
    prefix += ' renamed';
    await page.getByLabel('Author name').fill(prefix);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(prefix, { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Books', exact: true }).click();
    await page.getByRole('button', { name: 'Add book', exact: true }).click();
    await page.getByLabel('Book title').fill(`${prefix} — A new chapter`);
    await page.getByLabel('Author', { exact: true }).selectOption(String(authorId));
    await page.getByLabel('Publication year').fill('2026');
    const [createdBook] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/api/v1/books') && r.request().method() === 'POST',
      ),
      page.getByRole('dialog').getByRole('button', { name: 'Add book', exact: true }).click(),
    ]);
    expect(createdBook.status()).toBe(201);
    bookId = (await createdBook.json()).id;
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByLabel('FIND A BOOK').fill(prefix);
    await expect(page).toHaveURL(/title=Browser/);
    await expect(page.getByText(`${prefix} — A new chapter`, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Edit ${prefix} — A new chapter`, exact: true }).click();
    await page.getByLabel('Book title').fill(`${prefix} — Revised`);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByText(`${prefix} — Revised`, { exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'SORT BY' }).click();
    await page.getByRole('option', { name: 'Title · Z to A' }).click();
    await expect(page).toHaveURL(/sort=title/);
    await page.reload();
    await expect(page.getByLabel('FIND A BOOK')).toHaveValue(prefix);
    await expect(page.getByText(`${prefix} — Revised`, { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/bookshelf-desktop.png', fullPage: true });
    await page.getByRole('link', { name: 'Authors', exact: true }).click();
    await page.getByRole('button', { name: `Delete ${prefix}`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await expect(page.getByRole('alert')).toContainText('referenced');
    await page.getByRole('button', { name: 'Keep it' }).click();
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Library overview' })).toBeVisible();
    await expect(page.getByRole('table')).toContainText(prefix);
    await page.getByRole('link', { name: 'Service status', exact: true }).click();
    await expect(page.getByText('Operational', { exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Check again' }).click();
    await expect(page.getByText('Operational', { exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('link', { name: 'Books', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your bookshelf' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: 'test-results/bookshelf-mobile.png', fullPage: true });
    await page.getByLabel('FIND A BOOK').fill(prefix);
    await expect(page.getByText(`${prefix} — Revised`, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Delete ${prefix} — Revised`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();
    bookId = undefined;
    await page.getByRole('link', { name: 'Authors', exact: true }).click();
    await page.getByRole('button', { name: `Delete ${prefix}`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete permanently' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();
    authorId = undefined;
    expect(errors).toEqual([]);
  } finally {
    if (bookId) expect((await request.delete(`/api/v1/books/${bookId}`)).status()).toBe(204);
    if (authorId) expect((await request.delete(`/api/v1/authors/${authorId}`)).status()).toBe(204);
  }
});
test('missing page returns 404 and a useful way back', async ({ page }) => {
  const response = await page.goto('/missing-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Nothing on this shelf.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to your books →' }).click();
  await expect(page.getByRole('heading', { name: 'Your bookshelf' })).toBeVisible();
});
