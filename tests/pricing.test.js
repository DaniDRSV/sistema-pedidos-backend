const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLine, calculateTotals } = require('../src/domain/services/pricing');

test('calcula el IVA del 13% por línea', () => {
  const line = calculateLine({ unitPrice: 0.75, quantity: 3 });
  assert.deepEqual(
    [line.unitPriceWithTax, line.subtotal, line.tax, line.total],
    [0.85, 2.25, 0.3, 2.55]
  );
});

test('los totales son la suma de las líneas', () => {
  const totals = calculateTotals([
    { unitPrice: 0.75, quantity: 3 },
    { unitPrice: 1.25, quantity: 1 }
  ]);
  assert.deepEqual([totals.subtotal, totals.tax, totals.total], [3.5, 0.46, 3.96]);
});
