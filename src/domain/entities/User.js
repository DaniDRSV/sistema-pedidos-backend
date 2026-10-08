const ROLES = Object.freeze(['ADMIN', 'CLIENT', 'DELIVERY']);
const VEHICLE_TYPES = Object.freeze(['MOTORCYCLE', 'CAR', 'BICYCLE']);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

class User {
  constructor({
    id,
    roleId,
    roleName,
    fullName,
    email,
    passwordHash,
    phone,
    isActive,
    createdAt,
    activeOrders,
    deliveredOrders,
    ordersCount,
    totalSpent,
    lastOrderAt,
    deliveryProfile
  }) {
    this.id = id;
    this.roleId = roleId;
    this.roleName = roleName;
    this.fullName = fullName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.phone = phone;
    this.isActive = isActive ?? true;
    this.createdAt = createdAt;
    this.activeOrders = Number(activeOrders || 0);
    this.deliveredOrders = Number(deliveredOrders || 0);
    this.ordersCount = Number(ordersCount || 0);
    this.totalSpent = Number(totalSpent || 0);
    this.lastOrderAt = lastOrderAt || null;
    this.deliveryProfile = deliveryProfile || null;
  }

  static isValidRole(role) {
    return ROLES.includes(role);
  }

  static isValidVehicle(vehicleType) {
    return VEHICLE_TYPES.includes(vehicleType);
  }

  static isValidEmail(email) {
    return EMAIL_REGEX.test(String(email || '').trim());
  }

  static isStrongPassword(password) {
    return PASSWORD_REGEX.test(String(password || ''));
  }

  isDelivery() {
    return this.roleName === 'DELIVERY';
  }

  isAvailableForDelivery() {
    const profileAvailable = this.deliveryProfile ? this.deliveryProfile.isAvailable : true;
    return this.isActive && profileAvailable && this.activeOrders === 0;
  }

  toResponse() {
    return {
      id: this.id,
      role: this.roleName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      isActive: this.isActive,
      available: this.isAvailableForDelivery(),
      activeOrders: this.activeOrders
    };
  }

  toAdminResponse() {
    return {
      ...this.toResponse(),
      createdAt: this.createdAt,
      deliveredOrders: this.deliveredOrders,
      ordersCount: this.ordersCount,
      totalSpent: this.totalSpent,
      lastOrderAt: this.lastOrderAt,
      deliveryProfile: this.deliveryProfile
    };
  }
}

User.ROLES = ROLES;
User.VEHICLE_TYPES = VEHICLE_TYPES;

module.exports = User;
