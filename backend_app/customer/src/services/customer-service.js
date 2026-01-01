const { CustomerRepository } = require("../database");
const {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");

// All Business logic will be here
class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  // ===== NEW PHONE AUTH METHODS =====

  // Signup with phone
  async SignUpWithPhone(userInputs) {
    const { phone, password, name, email, firebaseUid } = userInputs;

    // Check if phone already exists
    const existingCustomer = await this.repository.FindCustomerByPhone(phone);
    if (existingCustomer) {
      throw new Error("Phone number already registered");
    }

    // Create salt and hash password
    let salt = await GenerateSalt();
    let userPassword = await GeneratePassword(password, salt);

    // Create customer
    const newCustomer = await this.repository.CreateCustomerWithPhone({
      phone,
      password: userPassword,
      salt,
      name,
      email,
      firebaseUid,
      phoneVerified: true, // Already verified via OTP
    });

    // Generate JWT token
    const token = await GenerateSignature({
      phone: newCustomer.phone,
      _id: newCustomer._id,
    });

    return FormateData({
      id: newCustomer._id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      isAdmin: newCustomer.isAdmin,
      token,
    });
  }

  // Login with phone + password
  async SignInWithPhone(userInputs) {
    const { phone, password } = userInputs;

    const existingCustomer = await this.repository.FindCustomerByPhone(phone);

    if (!existingCustomer) {
      return FormateData({ message: "Account not found" });
    }

    // Validate password
    const validPassword = await ValidatePassword(
      password,
      existingCustomer.password,
      existingCustomer.salt
    );

    if (validPassword) {
      // Update last login
      await this.repository.UpdateLastLogin(existingCustomer._id);

      const token = await GenerateSignature({
        phone: existingCustomer.phone,
        _id: existingCustomer._id,
      });

      return FormateData({
        id: existingCustomer._id,
        name: existingCustomer.name,
        phone: existingCustomer.phone,
        email: existingCustomer.email,
        isAdmin: existingCustomer.isAdmin,
        token,
      });
    }

    return FormateData({ message: "Invalid credentials" });
  }

  // Login with OTP (passwordless)
  async LoginWithOTP(phone) {
    const existingCustomer = await this.repository.FindCustomerByPhone(phone);

    if (!existingCustomer) {
      throw new Error("Account not found");
    }

    // Update last login
    await this.repository.UpdateLastLogin(existingCustomer._id);

    const token = await GenerateSignature({
      phone: existingCustomer.phone,
      _id: existingCustomer._id,
    });

    return FormateData({
      id: existingCustomer._id,
      name: existingCustomer.name,
      phone: existingCustomer.phone,
      email: existingCustomer.email,
      isAdmin: existingCustomer.isAdmin,
      token,
    });
  }

  // Find customer by phone
  async FindCustomerByPhone(phone) {
    return await this.repository.FindCustomerByPhone(phone);
  }

  // ===== EXISTING METHODS (Keep for backward compatibility) =====

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    const existingCustomer = await this.repository.FindCustomer({ email });

    if (existingCustomer) {
      const validPassword = await ValidatePassword(
        password,
        existingCustomer.password,
        existingCustomer.salt
      );
      if (validPassword) {
        const token = await GenerateSignature({
          email: existingCustomer.email,
          _id: existingCustomer._id,
        });
        return FormateData({
          id: existingCustomer._id,
          isAdmin: existingCustomer?.isAdmin,
          token,
        });
      }
    }

    return FormateData({ message: "user not found" });
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    const existingCustomer = await this.repository.CreateCustomer({
      email,
      password: userPassword,
      phone,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: existingCustomer._id,
    });
    return FormateData({ id: existingCustomer._id, token });
  }

  async getUsers() {
    const all = await this.repository.allusers();
    return FormateData(all);
  }

  async AddNewAddress(_id, userInputs) {
    const { type, completeAddress, latitude, longitude } = userInputs;

    const addressResult = await this.repository.CreateAddress({
      _id,
      type,
      completeAddress,
      latitude,
      longitude,
    });

    return FormateData(addressResult);
  }

  async getAddresses(_id) {
    const allAddresses = await this.repository.getAllAddresses({ _id });

    return FormateData(allAddresses);
  }

  async GetProfile(id) {
    const existingCustomer = await this.repository.FindCustomerById({ id });
    return FormateData(existingCustomer);
  }

  async GetShopingDetails(id) {
    const existingCustomer = await this.repository.FindCustomerById({ id });

    if (existingCustomer) {
      return FormateData(existingCustomer);
    }
    return FormateData({ msg: "Error" });
  }

  async GetWishList(customerId) {
    const wishListItems = await this.repository.Wishlist(customerId);
    return FormateData(wishListItems);
  }

  async AddToWishlist(customerId, product) {
    const wishlistResult = await this.repository.AddWishlistItem(
      customerId,
      product
    );
    return FormateData(wishlistResult);
  }

  async ManageCart(customerId, product, qty, isRemove) {
    const cartResult = await this.repository.AddCartItem(
      customerId,
      product,
      qty,
      isRemove
    );
    return FormateData(cartResult);
  }

  async ManageOrder(customerId, order) {
    const orderResult = await this.repository.AddOrderToProfile(
      customerId,
      order
    );
    return FormateData(orderResult);
  }

  async SubscribeEvents(payload) {
    console.log("Triggering.... Customer Events");

    payload = JSON.parse(payload);

    const { event, data } = payload;

    const { userId, product, order, qty } = data;

    switch (event) {
      case "ADD_TO_WISHLIST":
      case "REMOVE_FROM_WISHLIST":
        this.AddToWishlist(userId, product);
        break;
      case "ADD_TO_CART":
        this.ManageCart(userId, product, qty, false);
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, true);
        break;
      case "CREATE_ORDER":
        this.ManageOrder(userId, order);
        break;
      default:
        break;
    }
  }
}

module.exports = CustomerService;