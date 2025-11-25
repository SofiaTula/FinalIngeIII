// jest.env.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { TextEncoder, TextDecoder } from 'util';

// Importar el módulo y extraer la clase constructora.
// Se usa .default porque jest-environment-jsdom es un CJS package
// consumido en un contexto de ES Module, y su exportación se anida en 'default'.
const JsdomEnvironmentModule = require('jest-environment-jsdom');
const JsdomEnvironment = JsdomEnvironmentModule.default || JsdomEnvironmentModule;

export default class CustomEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();
    // Inyectar TextEncoder y TextDecoder al global para compatibilidad con fetch en JSDOM
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    
    // Si necesitas simular window.location, también puedes hacerlo aquí si aplica
    // Ej: this.global.window.location.hostname = 'localhost';
  }
  
  // Es buena práctica incluir el teardown aunque no haga nada extra
  async teardown() {
    await super.teardown();
  }
}