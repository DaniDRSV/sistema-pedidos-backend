const test = require('node:test');
const assert = require('node:assert/strict');
const { errorHandler } = require('../src/infrastructure/web/middlewares/error.middleware');
const AppError = require('../src/domain/errors/AppError');

const run = (err) => {
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  const log = console.error;
  console.error = () => {};
  errorHandler(err, { method: 'GET', originalUrl: '/test' }, res, () => {});
  console.error = log;
  return res;
};

test('responde todos los errores con el mismo formato', () => {
  const cases = [
    [new AppError('Datos inválidos', 400), 400, 'VALIDATION_ERROR'],
    [new AppError('Sin sesión', 401), 401, 'UNAUTHORIZED'],
    [new AppError('Sin permiso', 403), 403, 'FORBIDDEN'],
    [new AppError('No existe', 404), 404, 'NOT_FOUND'],
    [new AppError('Sin stock', 409, [{ productId: 1 }]), 409, 'CONFLICT'],
    [Object.assign(new Error('duplicado'), { code: '23505' }), 409, 'CONFLICT'],
    [new Error('fallo de conexión'), 500, 'INTERNAL_ERROR']
  ];

  for (const [error, status, code] of cases) {
    const res = run(error);
    assert.equal(res.statusCode, status);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, code);
  }
});

test('no expone detalles internos en errores 500', () => {
  const res = run(new Error('password authentication failed for user postgres'));
  assert.doesNotMatch(res.body.message, /password/);
});
