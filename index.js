const fs = require('fs');
const appRootDir = require('app-root-dir');

class I18n {
  _fileExists(file) {
    return (
      fs.existsSync(file) ||
      fs.existsSync(`${file}.js`) ||
      fs.existsSync(`${file}.json`)
    );
  }

  constructor() {
    this.projectDirectory = appRootDir.get();
  }

  configure(options = {}) {
    if (options.directory && !this._fileExists(options.directory)) {
      throw new Error(
        `[actions-on-google-i18n] directory "${
          options.directory
        }" does not exist.`
      );
    }

    if (options.defaultFile && !this._fileExists(options.defaultFile)) {
      throw new Error(
        `[actions-on-google-i18n] file "${options.defaultFile}" does not exist.`
      );
    }

    this._options = options;
    this.directory =
      options.directory || `${this.projectDirectory}/src/locales`;
    this.defaultFile =
      options.defaultFile || `${this.projectDirectory}/src/locales/index.json`;
    this.defaultLocale = options.defaultLocale || 'en-US';
    this.defaultExtension = options.defaultExtension;

    return this;
  }

  loadLocaleFile(locale) {
    let filename = `${this.directory}/${locale}`;

    if (this.defaultExtension) {
      if (['js', 'json'].includes(this.defaultExtension)) {
        filename = `${filename}.${this.defaultExtension}`;
      } else {
        throw new Error(
          `[actions-on-google-i18n] extension "${
            this.defaultExtension
            }" is not allowed. Only "js" and "json" files are allowed.`
        );
      }
    }

    return this._fileExists(filename) ? require(filename) : null;
  }

  loadLocales(locale) {
    let countryLocales = this.loadLocaleFile(locale.split('-')[0]);
    const languageLocales = this.loadLocaleFile(locale);

    if (!countryLocales && !languageLocales) {
      // Fallback to default file if available
      if (this._options.defaultFile && this._fileExists(this.defaultFile)) {
        countryLocales = require(this.defaultFile);
      } else {
        throw new Error(
          `[actions-on-google-i18n] can't load files for locale "${locale}".`
        );
      }
    }

    let locales = languageLocales || countryLocales;
    if (countryLocales && languageLocales) {
      // Both country and language level locale exists, merge them
      locales = Object.assign({}, countryLocales, languageLocales);
    }

    return locales;
  }

  use(app) {
    if (!this._options) {
      this.configure();
    }

    const __i18nFactory = conv => {
      const locales = this.loadLocales(this.getLocale(conv));

      return (key, context = {}) => {
        let translation = locales[key] || '';

        if (translation) {
          for (let ctxKey in context) {
            translation = translation.replace(
              '{' + ctxKey + '}',
              context[ctxKey]
            );
          }
        }

        return translation;
      };
    };

    // Register a middleware to set i18n function on each conv
    app.middleware(conv => {
      conv.__ = conv.i18n = __i18nFactory(conv);
    });

    app.__ = app.i18n = __i18nFactory();
  }

  getLocale(conv) {
    let locale = conv && conv.user && conv.user.locale;

    if (!locale) {
      locale = this.defaultLocale;
    }

    if (!locale) {
      throw new Error(
        `[actions-on-google-i18n] Locale is not valid. Found "${locale}".`
      );
    }

    return locale.toLowerCase();
  }
}

module.exports = new I18n();
