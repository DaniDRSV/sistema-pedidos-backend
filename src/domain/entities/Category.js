class Category {
  constructor({ id, name, description, imageUrl, isActive, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = Category;