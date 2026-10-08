const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('../src/domain/entities/Order');
const { OrderState, OrderStateMachine } = require('../src/domain/entities/OrderStateMachine');

const newOrder = (status = OrderState.CREADO) =>
  new Order({ id: 1, orderNumber: 'ORD-000001', total: 10, subtotal: 8.85, deliveryFee: 0, status });

test('recorre el flujo completo CREADO → ENTREGADO', () => {
  const order = newOrder();
  order.markAsPaid().startPreparation().dispatch().deliver();
  assert.equal(order.status, OrderState.ENTREGADO);
  assert.equal(order.paymentStatus, 'PAID');
  assert.ok(order.preparedAt && order.shippedAt && order.deliveredAt);
  assert.equal(order.isTerminal(), true);
});

test('pago contra entrega puede pasar de CREADO a EN_PREPARACION', () => {
  assert.equal(newOrder().startPreparation().status, OrderState.EN_PREPARACION);
});

test('rechaza saltos de estado no permitidos', () => {
  assert.throws(() => newOrder().deliver(), { name: 'InvalidStateTransitionError', statusCode: 400 });
  assert.throws(() => newOrder(OrderState.PAGADO).dispatch(), { statusCode: 400 });
});

test('los estados finales no admiten cambios', () => {
  assert.throws(() => newOrder(OrderState.ENTREGADO).cancel(), { statusCode: 400 });
  assert.throws(() => newOrder(OrderState.CANCELADO).markAsPaid(), { statusCode: 400 });
});

test('un estado desconocido responde 400', () => {
  assert.throws(() => newOrder().transitionTo('VOLANDO'), { statusCode: 400 });
});

test('cancelar guarda el motivo solo si la transición es válida', () => {
  const order = newOrder().cancel('Cliente no responde');
  assert.equal(order.status, OrderState.CANCELADO);
  assert.match(order.notes, /Cliente no responde/);

  const delivered = newOrder(OrderState.ENTREGADO);
  assert.throws(() => delivered.cancel('tarde'));
  assert.equal(delivered.notes, undefined);
});

test('acepta los nombres anteriores en inglés', () => {
  assert.equal(OrderStateMachine.normalize('PENDING'), OrderState.CREADO);
  assert.equal(OrderStateMachine.normalize('in_delivery'), OrderState.EN_CAMINO);
});
