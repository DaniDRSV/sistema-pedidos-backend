const AppError = require('./AppError');

class InvalidStateTransitionError extends AppError {
  constructor(currentState, targetState, allowedStates = []) {
    const allowedText = allowedStates.length > 0
      ? ` Transiciones permitidas desde '${currentState}': [${allowedStates.join(', ')}].`
      : ` El estado '${currentState}' es un estado terminal y no admite más transiciones.`;

    super(
      `Transición de estado inválida: no es posible cambiar de '${currentState}' a '${targetState}'.${allowedText}`,
      400,
      { currentState, targetState, allowedStates }
    );
    this.name = 'InvalidStateTransitionError';
  }
}

module.exports = InvalidStateTransitionError;
