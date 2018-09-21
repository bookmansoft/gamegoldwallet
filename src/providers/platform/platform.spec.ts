import { TestUtils } from '../../test';
import { PlatformProvider } from './platform';

describe('PlatformProvider', () => {
  let service: PlatformProvider;
  let realUserAgent;

  beforeEach(() => {
    const testBed = TestUtils.configureProviderTestingModule();
    service = testBed.get(PlatformProvider);
  });

  it('should get browser name', () => {
    let name = service.getBrowserName();
    expect(name).toBe('chrome');
  });

  it('should return "unknown" if browser is unknown', () => {
    realUserAgent = window.navigator.userAgent;
    Object.defineProperties(window.navigator, {
      userAgent: {
        value: 'someUnknownCoolBrowser v1.0',
        writable: true
      }
    });

    let name = service.getBrowserName();
    expect(name).toBe('unknown');

    Object.defineProperties(window.navigator, {
      userAgent: {
        value: realUserAgent,
        writable: false
      }
    });
  });
});

describe('PlatformProvider without navigator', () => {
  let service: PlatformProvider;
  let realNavigator;

  beforeEach(() => {
    realNavigator = window.navigator;
    Object.defineProperties(window, {
      navigator: {
        value: null,
        writable: true
      }
    });
  });

  beforeEach(() => {
    const testBed = TestUtils.configureProviderTestingModule();
    service = testBed.get(PlatformProvider);
  });

  afterEach(() => {
    Object.defineProperties(window, {
      navigator: {
        value: realNavigator,
        writable: false
      }
    });
  });

  it('should have a dummy user agent', () => {
    let ua = service.ua;
    expect(ua).toBe('dummy user-agent');
  });
});
