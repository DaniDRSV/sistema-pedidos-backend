# API de reparto

Todas las rutas de esta sección requieren `Authorization: Bearer <token>`.

| Método y ruta | Rol | Descripción |
| --- | --- | --- |
| `GET /api/deliveries/couriers` | `ADMIN` | Lista repartidores activos. Incluye `available` y `activeOrders`; un repartidor está disponible cuando no tiene pedidos en preparación o en camino. |
| `GET /api/deliveries/orders/me` | `DELIVERY` | Devuelve los pedidos asignados al repartidor autenticado. |
| `PUT /api/deliveries/orders/:id/assignment` | `ADMIN` | Asigna un pedido. Body: `{ "deliveryId": 3 }`. El pedido pasa a `EN_PREPARACION` si estaba creado o pagado. |
| `DELETE /api/deliveries/orders/:id/assignment` | `ADMIN`, `DELIVERY` | El administrador o el repartidor asignado retira la asignación antes de que el pedido salga a reparto. |
| `PATCH /api/deliveries/orders/:id/start` | `DELIVERY` | Cambia un pedido propio de `EN_PREPARACION` a `EN_CAMINO`. |
| `PATCH /api/deliveries/orders/:id/complete` | `DELIVERY` | Cambia un pedido propio de `EN_CAMINO` a `ENTREGADO`; también deja el pago contra entrega como pagado. |

`POST /api/orders` también acepta `paymentMethod` con los valores `CARD` y `CASH_ON_DELIVERY`. El primero crea el pedido como `PAGADO`; el segundo como `CREADO` y pago `PENDING`.

Las respuestas de pedidos incluyen ahora `deliveryId` y el objeto `delivery` cuando hay un repartidor asignado.
