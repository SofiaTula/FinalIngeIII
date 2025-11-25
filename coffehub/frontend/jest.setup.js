import { jest } from '@jest/globals';

global.fetch = jest.fn();
global.alert = jest.fn();
global.confirm = jest.fn();

console.log('✅ Mocks globales cargados');
