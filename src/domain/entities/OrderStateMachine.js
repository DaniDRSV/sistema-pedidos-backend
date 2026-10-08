const InvalidStateTransitionError = require('../errors/InvalidStateTransitionError');
const AppError = require('../errors/AppError');

/**
 * Estados del Ciclo de Vida del Pedido (Máquina de Estados Finita)
 */
const OrderState = Object.freeze({
  CREADO: 'CREADO',
  PAGADO: 'PAGADO',
  EN_PREPARACION: 'EN_PREPARACION',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO'
});

/**
 * Tabla de Transiciones Válidas de la FSM
 * Define estrictamente hacia qué estados puede avanzar cada estado actual.
 */
const TRANSITION_TABLE = Object.freeze({
  [OrderState.CREADO]: [
    OrderState.PAGADO,
    OrderState.EN_PREPARACION, // Flujo de pago contra entrega (efectivo al recibir)
    OrderState.CANCELADO
  ],
  [OrderState.PAGADO]: [
    OrderState.EN_PREPARACION,
    OrderState.CANCELADO
  ],
  [OrderState.EN_PREPARACION]: [
    OrderState.EN_CAMINO,
    OrderState.CANCELADO
  ],
  [OrderState.EN_CAMINO]: [
    OrderState.ENTREGADO,
    OrderState.CANCELADO
  ],
  [OrderState.ENTREGADO]: [], // Estado final
  [OrderState.CANCELADO]: []  // Estado final
});

/**
 * Diccionario de equivalencias para compatibilidad con registros legados o en inglés.
 */
const ALIASES = Object.freeze({
  PENDING: OrderState.CREADO,
  PAID: OrderState.PAGADO,
  PREPARING: OrderState.EN_PREPARACION,
  READY: OrderState.EN_PREPARACION,
  IN_DELIVERY: OrderState.EN_CAMINO,
  DELIVERED: OrderState.ENTREGADO,
  CANCELLED: OrderState.CANCELADO
});

class OrderStateMachine {
  /**
   * Normaliza una cadena de estado a su representación canónica del dominio.
   */
  static normalize(state) {
    if (!state || typeof state !== 'string') return OrderState.CREADO;
    const upper = state.trim().toUpperCase();
    return ALIASES[upper] || OrderState[upper] || upper;
  }

  /**
   * Verifica si un estado dado es un estado válido del dominio.
   */
  static isValidState(state) {
    const canonical = this.normalize(state);
    return Object.values(OrderState).includes(canonical);
  }

  /**
   * Obtiene la lista de transiciones permitidas desde un estado origen.
   */
  static getAllowedTransitions(currentState) {
    const canonical = this.normalize(currentState);
    return TRANSITION_TABLE[canonical] ? [...TRANSITION_TABLE[canonical]] : [];
  }

  /**
   * Evalúa si una transición es válida sin lanzar excepción.
   */
  static canTransition(fromState, toState) {
    const from = this.normalize(fromState);
    const to = this.normalize(toState);
    if (!this.isValidState(from) || !this.isValidState(to)) return false;
    if (from === to) return true; // Mantenerse en el mismo estado es no-op válido
    const allowed = TRANSITION_TABLE[from] || [];
    return allowed.includes(to);
  }

  /**
   * Valida la transición y lanza InvalidStateTransitionError si no está permitida.
   */
  static validateTransition(fromState, toState) {
    const from = this.normalize(fromState);
    const to = this.normalize(toState);

    if (!this.isValidState(to)) {
      throw new AppError(
        `El estado '${toState}' no es reconocido. Estados válidos: ${Object.values(OrderState).join(', ')}`,
        400
      );
    }

    if (from === to) {
      return to; // Sin cambios
    }

    const allowed = TRANSITION_TABLE[from] || [];
    if (!allowed.includes(to)) {
      throw new InvalidStateTransitionError(from, to, allowed);
    }

    return to;
  }

  /**
   * Indica si el estado es terminal (ENTREGADO o CANCELADO).
   */
  static isTerminal(state) {
    const canonical = this.normalize(state);
    return canonical === OrderState.ENTREGADO || canonical === OrderState.CANCELADO;
  }
}

module.exports = {
  OrderState,
  OrderStateMachine
};
