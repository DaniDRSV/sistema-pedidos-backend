# Formato de respuestas

Todas las rutas responden con el mismo formato.

```json
{ "success": true, "message": "OK", "data": {} }
{ "success": false, "message": "Stock insuficiente para uno o más productos.", "error": { "code": "CONFLICT", "details": [] } }
```

| HTTP | `error.code` |
| --- | --- |
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 500 | `INTERNAL_ERROR` |

# API de pedidos

| Método y ruta | Rol | Descripción |
| --- | --- | --- |
| `POST /api/orders` | `CLIENT` | Crea el pedido. Body: `{ "items": [{ "productId": 1, "quantity": 2 }], "address": "...", "notes": "...", "paymentMethod": "CASH_ON_DELIVERY" }` |
| `GET /api/orders/me` | `CLIENT` | Pedidos del cliente autenticado. |
| `GET /api/orders/preparation?status=` | `ADMIN`, `DELIVERY` | Cola de pedidos, filtrable por estado. |
| `GET /api/orders/:id` | Dueño, repartidor asignado o `ADMIN` | Detalle de un pedido. |
| `PATCH /api/orders/:id/status` | `ADMIN` | Cambia el estado. Body: `{ "status": "PAGADO", "reason": "..." }`. Al cancelar se devuelve el stock. |

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
