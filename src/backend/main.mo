import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Category = {
    #livingRoom;
    #bedroom;
    #kitchen;
    #bathroom;
    #outdoor;
  };

  type Product = {
    id : Text;
    name : Text;
    category : Category;
    description : Text;
    price : Nat;
    imageUrl : Text;
    isAvailable : Bool;
  };

  let products = Map.empty<Text, Product>();

  public query ({ caller = _ }) func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller = _ }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller = _ }) func listAvailableProducts() : async [Product] {
    products.values().toArray().filter(
      func(p) { p.isAvailable }
    );
  };

  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    priceAtPurchase : Nat;
  };

  public type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  public type Order = {
    id : Text;
    customerName : Text;
    customerEmail : Text;
    shippingAddress : ShippingAddress;
    items : [OrderItem];
    totalAmount : Nat;
    status : OrderStatus;
    paymentIntentId : Text;
    createdAt : Time.Time;
  };

  let orders = Map.empty<Text, Order>();

  public shared ({ caller = _ }) func createOrder(
    customerName : Text,
    customerEmail : Text,
    shippingAddress : ShippingAddress,
    items : [OrderItem],
    paymentIntentId : Text,
  ) : async Text {
    let totalAmount = items.values().foldLeft(
      0,
      func(acc, item) {
        acc + (item.priceAtPurchase * item.quantity);
      },
    );
    let orderId = (orders.size() + 1).toText();

    let newOrder : Order = {
      id = orderId;
      customerName;
      customerEmail;
      shippingAddress;
      items;
      totalAmount;
      paymentIntentId;
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getOrder(id : Text) : async Order {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func listOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerName = order.customerName;
          customerEmail = order.customerEmail;
          shippingAddress = order.shippingAddress;
          items = order.items;
          totalAmount = order.totalAmount;
          paymentIntentId = order.paymentIntentId;
          status;
          createdAt = order.createdAt;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func seedProducts() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed products");
    };

    if (products.size() > 0) {
      Runtime.trap("Products already seeded");
    };

    let seededProducts : [Product] = [
      {
        id = "1";
        name = "Elegant Sofa";
        category = #livingRoom;
        description = "Luxurious and comfortable sofa for your living room.";
        price = 45000;
        imageUrl = "https://example.com/elegant-sofa.jpg";
        isAvailable = true;
      },
      {
        id = "2";
        name = "Modern Coffee Table";
        category = #livingRoom;
        description = "Stylish coffee table with a glass top.";
        price = 12000;
        imageUrl = "https://example.com/modern-coffee-table.jpg";
        isAvailable = true;
      },
      {
        id = "3";
        name = "Cozy Bed Frame";
        category = #bedroom;
        description = "Sturdy and elegant bed frame for restful sleep.";
        price = 23000;
        imageUrl = "https://example.com/cozy-bed-frame.jpg";
        isAvailable = true;
      },
      {
        id = "4";
        name = "Decorative Pillows";
        category = #bedroom;
        description = "Set of 4 decorative pillows for your bedroom.";
        price = 8000;
        imageUrl = "https://example.com/decorative-pillows.jpg";
        isAvailable = true;
      },
      {
        id = "5";
        name = "Kitchen Organizer Set";
        category = #kitchen;
        description = "Complete organizer set for a tidy kitchen.";
        price = 6000;
        imageUrl = "https://example.com/kitchen-organizer-set.jpg";
        isAvailable = true;
      },
      {
        id = "6";
        name = "Outdoor Patio Set";
        category = #outdoor;
        description = "Weather-resistant patio set for outdoor relaxation.";
        price = 35000;
        imageUrl = "https://example.com/outdoor-patio-set.jpg";
        isAvailable = true;
      },
      {
        id = "7";
        name = "Artistic Wall Clock";
        category = #livingRoom;
        description = "Unique wall clock for a touch of elegance.";
        price = 4500;
        imageUrl = "https://example.com/artistic-wall-clock.jpg";
        isAvailable = true;
      },
      {
        id = "8";
        name = "Shower Curtain";
        category = #bathroom;
        description = "Waterproof, stylish shower curtain.";
        price = 1500;
        imageUrl = "https://example.com/shower-curtain.jpg";
        isAvailable = true;
      },
      {
        id = "9";
        name = "Luxury Bedding Set";
        category = #bedroom;
        description = "Premium bedding set for a cozy night's sleep.";
        price = 19000;
        imageUrl = "https://example.com/luxury-bedding-set.jpg";
        isAvailable = true;
      },
      {
        id = "10";
        name = "Wall Art Painting";
        category = #livingRoom;
        description = "Modern wall art painting to enhance your space.";
        price = 8500;
        imageUrl = "https://example.com/wall-art-painting.jpg";
        isAvailable = true;
      },
      {
        id = "11";
        name = "Outdoor Solar Lights";
        category = #outdoor;
        description = "Energy-efficient solar lights for outdoor ambiance.";
        price = 3200;
        imageUrl = "https://example.com/solar-lights.jpg";
        isAvailable = true;
      },
      {
        id = "12";
        name = "Bathroom Vanity Mirror";
        category = #bathroom;
        description = "Elegant vanity mirror for your bathroom.";
        price = 5000;
        imageUrl = "https://example.com/bathroom-mirror.jpg";
        isAvailable = true;
      },
    ];

    for (product in seededProducts.values()) {
      products.add(product.id, product);
    };
  };

  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
