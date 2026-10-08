const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/domain/entities/User');
const CreateUser = require('../src/use-cases/users/CreateUser');
const UpdateUser = require('../src/use-cases/users/UpdateUser');
const ToggleUserStatus = require('../src/use-cases/users/ToggleUserStatus');

const admin = { id: 1, role: 'ADMIN' };

const repository = (user, { activeAdmins = 2 } = {}) => ({
  findById: async () => user,
  findByEmail: async () => null,
  countActiveAdmins: async () => activeAdmins,
  setActive: async (id, isActive) => new User({ ...user, isActive }),
  update: async (id, data) => new User({ ...user, ...data }),
  create: async (data) => new User({ id: 9, ...data })
});

test('CreateUser valida los datos y el rol', async () => {
  const createUser = new CreateUser({ userRepository: repository(null), passwordHasher: { hash: async () => 'hash' } });
  const base = { fullName: 'Ana López', email: 'ana@correo.com', phone: '7000-0000', password: 'Clave123' };

  await assert.rejects(createUser.execute({ ...base, email: 'no-es-correo' }), { statusCode: 400 });
  await assert.rejects(createUser.execute({ ...base, password: '123' }), { statusCode: 400 });
  await assert.rejects(createUser.execute({ ...base, role: 'CHEF' }), { statusCode: 400 });
  await assert.rejects(
    createUser.execute({ ...base, role: 'DELIVERY', deliveryProfile: { vehicleType: 'AVION' } }),
    { statusCode: 400 }
  );

  const created = await createUser.execute({ ...base, role: 'delivery', deliveryProfile: { licensePlate: 'm123' } });
  assert.equal(created.role, 'DELIVERY');
});

test('no permite desactivarse a uno mismo ni dejar el sistema sin administradores', async () => {
  const self = new User({ id: 1, roleName: 'ADMIN', isActive: true });
  await assert.rejects(new ToggleUserStatus({ userRepository: repository(self) }).execute(1, admin), { statusCode: 400 });

  const lastAdmin = new User({ id: 2, roleName: 'ADMIN', isActive: true });
  await assert.rejects(
    new ToggleUserStatus({ userRepository: repository(lastAdmin, { activeAdmins: 1 }) }).execute(2, admin),
    { statusCode: 409 }
  );
});

test('no permite desactivar a un repartidor con entregas en curso', async () => {
  const courier = new User({ id: 3, roleName: 'DELIVERY', isActive: true, activeOrders: 1 });
  await assert.rejects(new ToggleUserStatus({ userRepository: repository(courier) }).execute(3, admin), { statusCode: 409 });

  const free = new User({ id: 4, roleName: 'DELIVERY', isActive: true });
  const result = await new ToggleUserStatus({ userRepository: repository(free) }).execute(4, admin);
  assert.equal(result.isActive, false);
});

test('UpdateUser no deja que un administrador cambie su propio rol', async () => {
  const self = new User({ id: 1, roleName: 'ADMIN', fullName: 'Admin', email: 'a@a.com', phone: '1' });
  await assert.rejects(
    new UpdateUser({ userRepository: repository(self) }).execute(1, { role: 'CLIENT' }, admin),
    { statusCode: 400 }
  );
});

test('un repartidor marcado como no disponible no aparece disponible', () => {
  const courier = new User({ roleName: 'DELIVERY', isActive: true, deliveryProfile: { isAvailable: false } });
  assert.equal(courier.isAvailableForDelivery(), false);
});
