/**
 * Sistema de Internacionalización (i18n)
 * Maneja el cambio de idiomas entre español e inglés
 */

class I18n {
  constructor() {
    this.currentLang = this.getStoredLanguage() || 'es';
    this.translations = {};
    this.init();
  }

  /**
   * Inicializa el sistema i18n
   */
  async init() {
    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.updateLanguageButton();
  }

  /**
   * Obtiene el idioma guardado en localStorage
   */
  getStoredLanguage() {
    return localStorage.getItem('language');
  }

  /**
   * Guarda el idioma en localStorage
   */
  setStoredLanguage(lang) {
    localStorage.setItem('language', lang);
  }

  /**
   * Carga las traducciones desde el archivo JSON
   */
  async loadTranslations(lang) {
    try {
      const response = await fetch(`js/i18n/${lang}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback a español si hay error
      if (lang !== 'es') {
        await this.loadTranslations('es');
      }
    }
  }

  /**
   * Obtiene una traducción usando notación de punto (ej: "banner.title.line1")
   */
  getTranslation(key) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retorna la key si no encuentra la traducción
      }
    }

    return value;
  }

  /**
   * Aplica las traducciones a todos los elementos con data-i18n
   */
  applyTranslations() {
    // Elementos con texto simple
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);

      if (typeof translation === 'string') {
        element.innerHTML = translation;
      }
    });

    // Elementos con arrays (listas)
    document.querySelectorAll('[data-i18n-list]').forEach(element => {
      const key = element.getAttribute('data-i18n-list');
      const translations = this.getTranslation(key);

      if (Array.isArray(translations)) {
        element.innerHTML = '';
        translations.forEach(text => {
          const li = document.createElement('li');
          li.textContent = text;
          element.appendChild(li);
        });
      }
    });

    // Atributos alt de imágenes
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const translation = this.getTranslation(key);

      if (typeof translation === 'string') {
        element.alt = translation;
      }
    });
  }

  /**
   * Cambia el idioma
   */
  async changeLanguage(lang) {
    if (lang === this.currentLang) return;

    this.currentLang = lang;
    this.setStoredLanguage(lang);
    await this.loadTranslations(lang);
    this.applyTranslations();
    this.updateLanguageButton();
  }

  /**
   * Alterna entre español e inglés
   */
  async toggleLanguage() {
    const newLang = this.currentLang === 'es' ? 'en' : 'es';
    await this.changeLanguage(newLang);
  }

  /**
   * Actualiza el estado visual de los botones de idioma
   */
  updateLanguageButton() {
    const buttons = document.querySelectorAll('.navbar__lang-option');
    buttons.forEach(button => {
      const lang = button.getAttribute('data-lang');
      if (lang === this.currentLang) {
        button.classList.add('navbar__lang-option--active');
      } else {
        button.classList.remove('navbar__lang-option--active');
      }
    });
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Inicializar cuando el DOM esté listo
let i18n;

document.addEventListener('DOMContentLoaded', () => {
  i18n = new I18n();

  // Event listeners para los botones de cambio de idioma
  const langButtons = document.querySelectorAll('.navbar__lang-option');
  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      i18n.changeLanguage(lang);
    });
  });
});
