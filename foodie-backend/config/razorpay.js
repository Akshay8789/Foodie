import Razorpay from "razorpay";

const createRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials are missing. Check your .env file."
    );
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export default createRazorpayInstance;