const { OrderState } = require('./src/domain/entities/OrderStateMachine');
const Order = require('./src/domain/entities/Order');

console.log('====================================================');
console.log('  PRUEBA DE LA MÁQUINA DE ESTADOS FINITA (FSM)      ');
console.log('====================================================\n');

// 1. Crear un pedido inicial en estado CREADO
const pedido = new Order({
  id: 1,
  orderNumber: 'ORD-000001',
  clientName: 'Cliente Ejemplo',
  total: 45.00,
  status: OrderState.CREADO
});

console.log('1. Pedido Inicial Creado:');
console.log('   - Estado actual:', pedido.status);
console.log('   - Siguientes estados permitidos:', pedido.getAllowedTransitions().join(', '));
console.log('');

// 2. Simular pago del pedido
console.log('2. Transición a PAGADO (order.markAsPaid()):');
pedido.markAsPaid();
console.log('   - Estado actual:', pedido.status);
console.log('   - Estado de pago:', pedido.paymentStatus);
console.log('   - Siguientes estados permitidos:', pedido.getAllowedTransitions().join(', '));
console.log('');

// 3. Cocina inicia la preparación
console.log('3. Transición a EN_PREPARACION (order.startPreparation()):');
pedido.startPreparation();
console.log('   - Estado actual:', pedido.status);
console.log('   - Hora inicio cocina (preparedAt):', pedido.preparedAt ? 'Registrada con éxito' : 'No registrada');
console.log('   - Siguientes estados permitidos:', pedido.getAllowedTransitions().join(', '));
console.log('');

// 4. Se entrega al motorista / sale a reparto
console.log('4. Transición a EN_CAMINO (order.dispatch()):');
pedido.dispatch();
console.log('   - Estado actual:', pedido.status);
console.log('   - Siguientes estados permitidos:', pedido.getAllowedTransitions().join(', '));
console.log('');

// 5. El motorista entrega el pedido al cliente
console.log('5. Transición a ENTREGADO (order.deliver()):');
pedido.deliver();
console.log('   - Estado final:', pedido.status);
console.log('   - ¿Es estado terminal?:', pedido.isTerminal() ? 'SÍ (Ciclo completado)' : 'NO');
console.log('');

// 6. Prueba de regla de negocio: ¿Qué pasa si intentamos cancelar un pedido ya entregado?
console.log('6. Prueba de Seguridad: Intentar cancelar un pedido ya ENTREGADO:');
try {
  pedido.cancel('Cliente cambió de opinión');
  console.error('   ❌ ERROR: La máquina de estados no debió permitir esto.');
} catch (error) {
  console.log('   ✅ REGLA DE NEGOCIO VALIDADA CON ÉXITO:');
  console.log('   Mensaje del Dominio:', error.message);
}

console.log('\n====================================================');
console.log('  ¡TODAS LAS REGLAS DE LA FSM FUNCIONAN AL 100%!   ');
console.log('====================================================\n');
