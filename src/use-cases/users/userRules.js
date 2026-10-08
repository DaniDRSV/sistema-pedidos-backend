const AppError = require('../../domain/errors/AppError');
const User = require('../../domain/entities/User');

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const validateUserData = ({ fullName, email, phone, role }) => {
  if (cleanText(fullName).length < 3) {
    throw new AppError('El nombre completo debe tener al menos 3 caracteres.', 400);
  }
  if (!User.isValidEmail(email)) {
    throw new AppError('El correo electrónico no es válido.', 400);
  }
  if (!cleanText(phone)) {
    throw new AppError('El teléfono es obligatorio.', 400);
  }
  if (!User.isValidRole(role)) {
    throw new AppError(`El rol debe ser uno de: ${User.ROLES.join(', ')}.`, 400);
  }
};

const normalizeDeliveryProfile = (profile = {}) => {
  const vehicleType = cleanText(profile.vehicleType).toUpperCase() || 'MOTORCYCLE';
  if (!User.isValidVehicle(vehicleType)) {
    throw new AppError(`El tipo de vehículo debe ser uno de: ${User.VEHICLE_TYPES.join(', ')}.`, 400);
  }
  return {
    vehicleType,
    licensePlate: cleanText(profile.licensePlate).toUpperCase() || null,
    driverLicense: cleanText(profile.driverLicense) || null,
    isAvailable: profile.isAvailable === undefined ? undefined : Boolean(profile.isAvailable)
  };
};

const ensureNotLastAdmin = async (userRepository, user) => {
  if (user.roleName !== 'ADMIN' || !user.isActive) return;
  const activeAdmins = await userRepository.countActiveAdmins();
  if (activeAdmins <= 1) {
    throw new AppError('Debe existir al menos un administrador activo.', 409);
  }
};

const ensureNoActiveDeliveries = (user) => {
  if (user.isDelivery() && user.activeOrders > 0) {
    throw new AppError('El repartidor tiene entregas en curso. Reasígnalas antes de continuar.', 409);
  }
};

module.exports = {
  cleanText,
  validateUserData,
  normalizeDeliveryProfile,
  ensureNotLastAdmin,
  ensureNoActiveDeliveries
};
