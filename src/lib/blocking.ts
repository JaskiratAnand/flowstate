import { browser } from 'wxt/browser';
import type { BlockingConfig, TimerState, BypassItem } from './types';

/**
 * Normalizes a website input into a clean domain name (e.g., lowercased, no protocol, path, port).
 */
export function getCleanDomain(site: string): string {
  let domain = site.trim().toLowerCase();
  if (domain.includes('://')) {
    try {
      domain = new URL(domain).hostname;
    } catch {
      domain = domain.split('://')[1];
    }
  }
  // Remove paths, queries, ports
  domain = domain.split('/')[0];
  domain = domain.split(':')[0];
  return domain;
}

/**
 * Checks if a domain is actively bypassed. Matches subdomains and parent domains.
 */
export function isDomainBypassed(
  site: string,
  bypassList: BypassItem[],
): boolean {
  const cleanSite = getCleanDomain(site);
  const now = Date.now();
  return bypassList.some((item) => {
    if (item.expiresAt <= now) return false;
    const cleanBypass = getCleanDomain(item.domain);
    return (
      cleanSite === cleanBypass ||
      cleanSite.endsWith(`.${cleanBypass}`) ||
      cleanBypass.endsWith(`.${cleanSite}`)
    );
  });
}

/**
 * Escapes special regex characters in a domain name.
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Compiles the active Focus Shield config, timer state, and active bypasses into
 * Chrome declarativeNetRequest Rules.
 */
export function generateDynamicRules(
  config: BlockingConfig,
  timerState: TimerState,
  bypassList: BypassItem[],
): any[] {
  // 1. Check if blocking is active
  const isBlockingActive =
    config.enabled &&
    (config.strictMode ||
      (timerState.status === 'running' && timerState.sessionType === 'work'));

  if (!isBlockingActive) {
    return [];
  }

  // 2. Determine effective mode based on Pro status
  const isPro = import.meta.env.WXT_PRO_VERSION === 'true';
  const effectiveMode = isPro ? config.mode : 'blocklist';

  // 3. Generate rules based on effective mode
  const redirectUrl = import.meta.env.FIREFOX
    ? `${browser.runtime.getURL('/blocked.html')}?url=\\0`
    : `chrome-extension://${browser.runtime.id}/blocked.html?url=\\0`;

  if (effectiveMode === 'blocklist') {
    const rules: any[] = [];
    const nonBypassedSites = config.blockedSites.filter(
      (site) => !isDomainBypassed(site, bypassList),
    );

    nonBypassedSites.forEach((site, index) => {
      const cleanSite = getCleanDomain(site);
      if (!cleanSite) return;

      const escapedSite = escapeRegex(cleanSite);
      rules.push({
        id: 1001 + index,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution: redirectUrl,
          },
        },
        condition: {
          regexFilter: `^https?://(?:[^/]*\\.)?${escapedSite}(?:/.*)?$`,
          resourceTypes: ['main_frame'],
        },
      });
    });

    return rules;
  } else {
    // allowlist mode
    const excludedDomains = [
      ...config.allowedSites.map(getCleanDomain),
      ...bypassList
        .filter((item) => item.expiresAt > Date.now())
        .map((item) => getCleanDomain(item.domain)),
    ];

    const uniqueExcluded = Array.from(new Set(excludedDomains)).filter(Boolean);

    return [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution: redirectUrl,
          },
        },
        condition: {
          regexFilter: '^https?://.*$',
          resourceTypes: ['main_frame'],
          excludedRequestDomains: uniqueExcluded,
          excludedInitiatorDomains: [browser.runtime.id],
        },
      },
    ];
  }
}
