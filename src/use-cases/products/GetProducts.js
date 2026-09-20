class GetProducts {
  constructor({ productRepository }) {
    this.productRepository = productRepository;
  }

  async execute(filters = {}) {
    // Solo mostramos productos activos por defecto, a menos que se especifique lo contrario
    const queryFilters = { ...filters };
    if (queryFilters.isActive === undefined) {
      queryFilters.isActive = true;
    }

    const products = await this.productRepository.findAll(queryFilters);
    return products.map(product => product.toResponse());
  }
}
module.exports = GetProducts;