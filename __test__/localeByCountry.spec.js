const i18n = require('../index');
const AppMock = require('./appMock');
const directory = `${__dirname}/src/locales`;

const mockApp = new AppMock();

describe('localeByCountry', () => {

  describe('when getUserLocale is en-US', () => {

    it('use "en-US" locale when provided', () => {
      i18n.configure({ directory, defaultExtension: 'json' }).use(mockApp);
      const conv = mockApp.newConv('en-US');
      expect(conv.__('key_3')).toBe('Hi. What can I do for ya?');
    });
  });

  describe('when getUserLocale is en-GB', () => {

    it('use "en" for missing key in "en-GB" locale', () => {
      i18n.configure({ directory, defaultExtension: 'json' }).use(mockApp);
      const conv = mockApp.newConv('en-GB');
      expect(conv.__("key")).toBe("value");
    });

    it('use "en-GB" locale when provided', () => {
      i18n.configure({ directory, defaultExtension: 'json' }).use(mockApp);
      const conv = mockApp.newConv('en-GB');
      expect(conv.__('key_3')).toBe('Hi. How can I help?');
    });
  });

  describe('when getUserLocale is en-xx', () => {

    it('fallback to "en" locale', () => {
      i18n.configure({ directory, defaultExtension: 'json' }).use(mockApp);
      const conv = mockApp.newConv('en-xx');
      expect(conv.__('key_3')).toBe('Hi');
    });
  });

});
