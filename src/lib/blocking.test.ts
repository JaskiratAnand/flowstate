import { describe, it, expect } from 'vitest';
import { generateDynamicRules, getCleanDomain } from './blocking';
import type { BlockingConfig, TimerState, BypassItem } from './types';

describe('Blocking Engine - Domain Cleaning', () => {
  it('cleans domains correctly', () => {
    expect(getCleanDomain('https://www.youtube.com')).toBe('www.youtube.com');
    expect(getCleanDomain('http://facebook.com/path?query=1')).toBe(
      'facebook.com',
    );
    expect(getCleanDomain('  REDDIT.COM  ')).toBe('reddit.com');
    expect(getCleanDomain('youtube.com:8080')).toBe('youtube.com');
  });
});

describe('Blocking Engine - Dynamic Rules Generator', () => {
  const defaultTimerState: TimerState = {
    status: 'running',
    remainingSeconds: 1500,
    sessionType: 'work',
    completedSessions: 0,
  };

  const defaultBlockingConfig: BlockingConfig = {
    enabled: true,
    mode: 'blocklist',
    strictMode: false,
    bypassDuration: 5,
    blockedSites: ['youtube.com', 'twitter.com', 'x.com'],
    allowedSites: ['wikipedia.org'],
  };

  const emptyBypasses: BypassItem[] = [];

  it('returns empty rules when blocker is disabled', () => {
    const config: BlockingConfig = { ...defaultBlockingConfig, enabled: false };
    const rules = generateDynamicRules(
      config,
      defaultTimerState,
      emptyBypasses,
    );
    expect(rules).toEqual([]);
  });

  it('returns empty rules when timer is idle and strictMode is false', () => {
    const timerState: TimerState = { ...defaultTimerState, status: 'idle' };
    const rules = generateDynamicRules(
      defaultBlockingConfig,
      timerState,
      emptyBypasses,
    );
    expect(rules).toEqual([]);
  });

  it('returns empty rules when timer is on break and strictMode is false', () => {
    const timerState: TimerState = {
      ...defaultTimerState,
      sessionType: 'short-break',
    };
    const rules = generateDynamicRules(
      defaultBlockingConfig,
      timerState,
      emptyBypasses,
    );
    expect(rules).toEqual([]);
  });

  it('generates rules when timer is idle but strictMode is true', () => {
    const config: BlockingConfig = {
      ...defaultBlockingConfig,
      strictMode: true,
    };
    const timerState: TimerState = { ...defaultTimerState, status: 'idle' };
    const rules = generateDynamicRules(config, timerState, emptyBypasses);
    expect(rules.length).toBe(3);
  });

  it('generates rules when timer is on break but strictMode is true', () => {
    const config: BlockingConfig = {
      ...defaultBlockingConfig,
      strictMode: true,
    };
    const timerState: TimerState = {
      ...defaultTimerState,
      sessionType: 'long-break',
    };
    const rules = generateDynamicRules(config, timerState, emptyBypasses);
    expect(rules.length).toBe(3);
  });

  describe('Blocklist Mode', () => {
    it('generates redirect rules for all non-bypassed blocked sites', () => {
      const rules = generateDynamicRules(
        defaultBlockingConfig,
        defaultTimerState,
        emptyBypasses,
      );
      expect(rules.length).toBe(3);

      expect(rules[0]).toEqual({
        id: 1001,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution:
              'chrome-extension://__MSG_@@extension_id__/blocked.html?url=\\0',
          },
        },
        condition: {
          regexFilter: '^https?://(?:[^/]*\\.)?youtube\\.com(?:/.*)?$',
          resourceTypes: ['main_frame'],
        },
      });

      expect(rules[1].condition.regexFilter).toBe(
        '^https?://(?:[^/]*\\.)?twitter\\.com(?:/.*)?$',
      );
      expect(rules[2].condition.regexFilter).toBe(
        '^https?://(?:[^/]*\\.)?x\\.com(?:/.*)?$',
      );
    });

    it('excludes active bypassed domains from being blocked', () => {
      const bypasses: BypassItem[] = [
        { domain: 'youtube.com', expiresAt: Date.now() + 100000 }, // active
        { domain: 'twitter.com', expiresAt: Date.now() - 1000 }, // expired
      ];

      const rules = generateDynamicRules(
        defaultBlockingConfig,
        defaultTimerState,
        bypasses,
      );
      // youtube.com bypassed (active), twitter.com expired (not bypassed), x.com not bypassed.
      // So only twitter.com and x.com rules should be generated.
      expect(rules.length).toBe(2);
      expect(rules.map((r) => r.condition.regexFilter)).toContain(
        '^https?://(?:[^/]*\\.)?twitter\\.com(?:/.*)?$',
      );
      expect(rules.map((r) => r.condition.regexFilter)).toContain(
        '^https?://(?:[^/]*\\.)?x\\.com(?:/.*)?$',
      );
      expect(rules.map((r) => r.condition.regexFilter)).not.toContain(
        '^https?://(?:[^/]*\\.)?youtube\\.com(?:/.*)?$',
      );
    });

    it('handles subdomain bypasses correctly', () => {
      const bypasses: BypassItem[] = [
        { domain: 'www.youtube.com', expiresAt: Date.now() + 100000 }, // active subdomain bypass
      ];
      const rules = generateDynamicRules(
        defaultBlockingConfig,
        defaultTimerState,
        bypasses,
      );
      // youtube.com matches subdomain bypass www.youtube.com
      expect(rules.length).toBe(2);
      expect(rules.map((r) => r.condition.regexFilter)).not.toContain(
        '^https?://(?:[^/]*\\.)?youtube\\.com(?:/.*)?$',
      );
    });
  });

  describe('Allowlist Mode', () => {
    it('generates a single wildcard redirect rule with allowed sites excluded', () => {
      const config: BlockingConfig = {
        ...defaultBlockingConfig,
        mode: 'allowlist',
      };
      const rules = generateDynamicRules(
        config,
        defaultTimerState,
        emptyBypasses,
      );

      expect(rules.length).toBe(1);
      expect(rules[0]).toEqual({
        id: 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution:
              'chrome-extension://__MSG_@@extension_id__/blocked.html?url=\\0',
          },
        },
        condition: {
          regexFilter: '^https?://.*$',
          resourceTypes: ['main_frame'],
          excludedRequestDomains: ['wikipedia.org'],
        },
      });
    });

    it('includes active bypassed domains in excludedRequestDomains', () => {
      const config: BlockingConfig = {
        ...defaultBlockingConfig,
        mode: 'allowlist',
      };
      const bypasses: BypassItem[] = [
        { domain: 'google.com', expiresAt: Date.now() + 100000 }, // active
        { domain: 'bing.com', expiresAt: Date.now() - 1000 }, // expired
      ];
      const rules = generateDynamicRules(config, defaultTimerState, bypasses);

      expect(rules.length).toBe(1);
      expect(rules[0].condition.excludedRequestDomains).toContain(
        'wikipedia.org',
      );
      expect(rules[0].condition.excludedRequestDomains).toContain('google.com');
      expect(rules[0].condition.excludedRequestDomains).not.toContain(
        'bing.com',
      );
    });
  });
});
