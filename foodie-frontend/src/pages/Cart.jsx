import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty 🛒</h2>

        <p>
          Add some delicious food first.
        </p>

        <Link to="/">
          Browse Foods
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div
              className="cart-item"
              key={item._id}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item-info">
                <h3>{item.name}</h3>

                <p>
                  ₹{item.price} each
                </p>

                <div className="quantity-selector">
                  <button
                    onClick={() =>
                      decreaseQuantity(
                        item._id
                      )
                    }
                  >
                    -
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(
                        item._id
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <strong>
                  ₹{item.price * item.quantity}
                </strong>

                <button
                  className="remove-button"
                  onClick={() =>
                    removeFromCart(item._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹{subtotal}
            </strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <strong>₹40</strong>
          </div>

          <hr />

          <div className="summary-row total">
            <span>Total</span>

            <strong>
              ₹{subtotal + 40}
            </strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-button"
         >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;