import { test, expect } from '@playwright/test'
import { discoverFirstDetail } from './helpers/discover'

// Liveness probe for discovery (ST-166). An archive with no matching detail
// links must throw and name the archive. If discovery ever returns a value
// for a page with no links, this fails, so a page type cannot be skipped silently.
test('discovery throws when an archive has no detail links', async ({ page }) => {
  await expect(
    discoverFirstDetail(page, '/__no-such-archive__', /^\/case-studies\/[^/]+$/),
  ).rejects.toThrow(/__no-such-archive__/)
})
