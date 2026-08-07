class User {
  constructor({ id, roleId, roleName, fullName, email, passwordHash, phone, isActive, createdAt }) {
    this.id = id;
    this.roleId = roleId;
    this.roleName = roleName;
    this.fullName = fullName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.phone = phone;
    this.isActive = isActive ?? true;
    this.createdAt = createdAt;
  }


  toResponse() {
    return {
      id: this.id,
      role: this.roleName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone
    };
  }
}

module.exports = User;