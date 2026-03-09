# Marvel Steel API Documentation

### POST /api/v1/admin/login
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
  - None

---
### POST /api/v1/admin/logout
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
  - None

---
### GET /api/v1/admins/
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any

---
### POST /api/v1/admins/
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **admin_in** (Body): JSON/Form

---
### GET /api/v1/admins/{admin_id}
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **admin_id** (Path): any

---
### PUT /api/v1/admins/{admin_id}
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **admin_id** (Path): any
- **admin_in** (Body): JSON/Form

---
### DELETE /api/v1/admins/{admin_id}
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **admin_id** (Path): any

---
### GET /api/v1/admin/categories/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any

---
### POST /api/v1/admin/categories/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **category_in** (Body): JSON/Form

---
### PUT /api/v1/admin/categories/{category_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **category_id** (Path): any
- **category_in** (Body): JSON/Form

---
### DELETE /api/v1/admin/categories/{category_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **category_id** (Path): any

---
### GET /api/v1/admin/products/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any
- **category_id** (Query): any

---
### POST /api/v1/admin/products/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_in** (Body): JSON/Form

---
### PUT /api/v1/admin/products/{product_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any
- **product_in** (Body): JSON/Form

---
### DELETE /api/v1/admin/products/{product_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any

---
### GET /api/v1/admin/products/{product_id}/images
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any

---
### POST /api/v1/admin/products/{product_id}/images
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any
- **file** (Body): JSON/Form

---
### DELETE /api/v1/admin/products/images/{image_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **image_id** (Path): any

---
### PUT /api/v1/admin/products/images/{image_id}/set-main
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **image_id** (Path): any
- **product_id** (Query): any

---
### GET /api/v1/admin/products/{product_id}/sizes
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any

---
### POST /api/v1/admin/products/{product_id}/sizes
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **product_id** (Path): any
- **size_in** (Body): JSON/Form

---
### PUT /api/v1/admin/products/sizes/{size_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **size_id** (Path): any
- **size_in** (Body): JSON/Form

---
### DELETE /api/v1/admin/products/sizes/{size_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **size_id** (Path): any

---
### GET /api/v1/admin/orders/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any
- **search** (Query): any

---
### GET /api/v1/admin/orders/{order_id}
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **order_id** (Path): any

---
### PUT /api/v1/admin/orders/{order_id}/status
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **order_id** (Path): any
- **status_in** (Body): JSON/Form

---
### GET /api/v1/admin/dashboard/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
  - None

---
### GET /api/v1/admin/settings/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
  - None

---
### PUT /api/v1/admin/settings/
- **Description**: No description provided.
- **Authentication**: Super Admin
- **Parameters**:
- **settings_in** (Body): JSON/Form

---
### POST /api/v1/admin/reviews/
- **Description**: No description provided.
- **Authentication**: Admin (Staff or Super Admin)
- **Parameters**:
- **review_in** (Body): JSON/Form

---
### GET /categories/
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any

---
### GET /products/
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any
- **category_id** (Query): any
- **size_id** (Query): any

---
### GET /products/{product_id}
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **product_id** (Path): any

---
### POST /orders/
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **order_in** (Body): JSON/Form

---
### GET /orders/{order_id}
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **order_id** (Path): any

---
### GET /reviews/
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
- **skip** (Query): any
- **limit** (Query): any

---
### GET /
- **Description**: No description provided.
- **Authentication**: Public
- **Parameters**:
  - None

---
