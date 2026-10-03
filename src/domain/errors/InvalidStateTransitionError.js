class InvalidStateTransitionError extends Error {
  constructor(currentState, targetState, allowedStates = []) {
    const allowedText = allowedStates.length > 0 
      ? ` Transiciones permitidas desde '${currentState}': [${allowedStates.join(', ')}].` 
      : ` El estado '${currentState}' es un estado terminal y no admite más transiciones.`;
    
    super(`Transición de estado inválida: no es posible cambiar de '${currentState}' a '${targetState}'.${allowedText}`);
    this.name = 'InvalidStateTransitionError';
    this.statusCode = 400;
    this.currentState = currentState;
    this.targetState = targetState;
    this.allowedStates = allowedStates;
  }
}

module.exports = InvalidStateTransitionError;
