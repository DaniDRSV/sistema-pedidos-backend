// Precios guardados sin IVA. Cálculo en centavos para evitar errores de redondeo.
const TAX_PERCENT = 13;

const toCents = (amount) => Math.round(Number(amount) * 100);
const unitTaxCents = (unitCents) => Math.round((unitCents * TAX_PERCENT) / 100);

const calculateLine = ({ unitPrice, quantity }) => {
  const unit = toCents(unitPrice);
  const tax = unitTaxCents(unit);
  return {
    unitPrice: unit / 100,
    unitPriceWithTax: (unit + tax) / 100,
    quantity,
    subtotal: (unit * quantity) / 100,
    tax: (tax * quantity) / 100,
    total: ((unit + tax) * quantity) / 100
  };
};

const calculateTotals = (lines, deliveryFee = 0) => {
  const calculated = lines.map((line) => ({ ...line, ...calculateLine(line) }));
  const sum = (key) => calculated.reduce((acc, line) => acc + toCents(line[key]), 0);
  const fee = toCents(deliveryFee);
  return {
    lines: calculated,
    subtotal: sum('subtotal') / 100,
    tax: sum('tax') / 100,
    deliveryFee: fee / 100,
    total: (sum('subtotal') + sum('tax') + fee) / 100
  };
};

module.exports = { TAX_PERCENT, calculateLine, calculateTotals };
