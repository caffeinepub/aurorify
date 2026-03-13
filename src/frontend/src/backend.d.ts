import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ShippingAddress {
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export interface OrderItem {
    productId: string;
    quantity: bigint;
    priceAtPurchase: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    createdAt: Time;
    totalAmount: bigint;
    shippingAddress: ShippingAddress;
    items: Array<OrderItem>;
    customerEmail: string;
    paymentIntentId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Product {
    id: string;
    name: string;
    isAvailable: boolean;
    description: string;
    imageUrl: string;
    category: Category;
    price: bigint;
}
export enum Category {
    bedroom = "bedroom",
    bathroom = "bathroom",
    kitchen = "kitchen",
    livingRoom = "livingRoom",
    outdoor = "outdoor"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(customerName: string, customerEmail: string, shippingAddress: ShippingAddress, items: Array<OrderItem>, paymentIntentId: string): Promise<string>;
    createProduct(product: Product): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(id: string): Promise<Order>;
    getProduct(id: string): Promise<Product>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listAvailableProducts(): Promise<Array<Product>>;
    listOrders(): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    seedProducts(): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
