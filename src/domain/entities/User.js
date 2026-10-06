class User {
  constructor({ id, roleId, roleName, fullName, email, passwordHash, phone, isActive, createdAt, activeOrders }) {
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
  }


  toResponse() {
    return {
      id: this.id,
      role: this.roleName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      available: this.isActive && this.activeOrders === 0,
      activeOrders: this.activeOrders
    };
  }
}

module.exports = User;
