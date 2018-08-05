const i18n = require("../index");
const AppMock = require('./appMock');
const directory = `${__dirname}/src/locales`;

describe("defaultLocale", () => {

  it("trigger a specific exception for an invalid defaultLocale", () => {
    const mockApp = new AppMock();
    const defaultLocale = `es-xx`;
    const expectedError = `[actions-on-google-i18n] can't load files for locale "${defaultLocale}".`;
    i18n.configure({ directory, defaultLocale });

    expect(() => i18n.use(mockApp)).toThrowError(expectedError);
  });

  it("load locales from a valid defaultLocale", () => {
    const mockApp = new AppMock();
    const defaultLocale = `en-US`;
    i18n.configure({ directory, defaultLocale }).use(mockApp);
    const value = mockApp.__("key");
    expect(value).toEqual("value");
  });

});
