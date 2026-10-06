class GetDeliveryCouriers {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute() {
    const couriers = await this.userRepository.findActiveDeliveryUsers();
    return couriers.map((courier) => courier.toResponse());
  }
}

module.exports = GetDeliveryCouriers;
