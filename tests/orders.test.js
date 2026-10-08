const test = require('node:test');
const assert = require('node:assert/strict');
const CreateOrder = require('../src/use-cases/orders/CreateOrder');
const GetOrderById = require('../src/use-cases/orders/GetOrderById');
const UpdateOrderStatus = require('../src/use-cases/orders/UpdateOrderStatus');
const Order = require('../src/domain/entities/Order');

const orderRepository = (order) => ({
  findById: async () => order,
  updateStatus: async (id, status, changes) => new Order({ ...order, status, ...changes })
});

test('CreateOrder valida carrito y dirección antes de tocar la base de datos', async () => {
  const createOrder = new CreateOrder({
    orderRepository: {
      getDeliveryInfo: async () => ({ phone: '7000-0000', address: null }),
      createWithItems: async () => assert.fail('no debe guardar')
    }
  });

  await assert.rejects(createOrder.execute({ clientId: 1, items: [], address: 'Centro' }), { statusCode: 400 });
  await assert.rejects(
    createOrder.execute({ clientId: 1, items: [{ productId: 1, quantity: 0 }], address: 'Centro' }),
    { statusCode: 400 }
  );
  await assert.rejects(
    createOrder.execute({ clientId: 1, items: [{ productId: 1, quantity: 1 }], address: '' }),
    { statusCode: 400 }
  );
});

test('GetOrderById solo muestra el pedido a su cliente, al repartidor asignado o al admin', async () => {
  const order = new Order({ id: 5, clientId: 10, deliveryId: 20, total: 1, subtotal: 1, deliveryFee: 0 });
  const getOrderById = new GetOrderById({ orderRepository: orderRepository(order) });

  await getOrderById.execute(5, { id: 10, role: 'CLIENT' });
  await getOrderById.execute(5, { id: 20, role: 'DELIVERY' });
  await getOrderById.execute(5, { id: 1, role: 'ADMIN' });
  await assert.rejects(getOrderById.execute(5, { id: 11, role: 'CLIENT' }), { statusCode: 403 });
});

test('UpdateOrderStatus aplica la máquina de estados', async () => {
  const order = new Order({ id: 7, status: 'CREADO', total: 1, subtotal: 1, deliveryFee: 0 });
  const updateOrderStatus = new UpdateOrderStatus({ orderRepository: orderRepository(order) });

  const paid = await updateOrderStatus.execute({ orderId: 7, status: 'pagado' });
  assert.equal(paid.status, 'PAGADO');
  await assert.rejects(updateOrderStatus.execute({ orderId: 7, status: 'ENTREGADO' }), { statusCode: 400 });
});
