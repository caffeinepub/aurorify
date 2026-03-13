# Casa Nova - Dropshipping Home Decor Store

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Public storefront with home decor product catalog
- Product categories: Living Room, Bedroom, Kitchen, Bathroom, Outdoor
- Product listing page with filtering by category and price range
- Product detail page with images, description, price, and Add to Cart
- Shopping cart with quantity controls and order summary
- Checkout flow with customer info, shipping address, and Stripe payment
- Order confirmation page
- Admin panel (behind login) to manage products: add, edit, delete, toggle availability
- Sample seed products (10-15 home decor items with descriptions and prices)

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: Products store (id, name, category, description, price, imageUrl, stock, isAvailable), Orders store (id, customerInfo, items, total, status, stripePaymentId), Cart is frontend-only state
2. Backend APIs: getProducts, getProductById, createOrder, getOrders (admin), updateProduct (admin), createProduct (admin), deleteProduct (admin)
3. Authorization component for admin access
4. Stripe component for checkout payment processing
5. Frontend: Storefront layout with nav, category sidebar, product grid, product detail modal/page, cart drawer, checkout form, order confirmation, admin dashboard
