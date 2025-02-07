"use client";

import { useSearchParams } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { markBookingAsPaid } from "@/app/_lib/actions";

export default function PayNowPage() {
  const searchParams = useSearchParams();

  // Extract booking data from query parameters
  const bookingData = {
    id: searchParams.get("id"),
    totalPrice: parseFloat(searchParams.get("totalPrice")),
    numGuests: searchParams.get("numGuests"),
  };
  console.log(bookingData);

  return (
   <div> Payment Removed For Secuuroty Reasons </div>
  );
}
/* 
 <PayPalScriptProvider
      options={{
        "client-id":
          "ADD CLIENT ID HERE",
      }}
    >
      <div>
        <h1>Payment</h1>
        <br />
        <br />
        <p>Booking ID: {bookingData.id}</p>
        <p>Guests: {bookingData.numGuests}</p>
        <p>Total Price: ${bookingData.totalPrice}</p>

        <br />
        <br />

        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: bookingData.totalPrice.toFixed(2),
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              markBookingAsPaid(bookingData.id);
              alert(
                `Transaction completed by ${details.payer.name.given_name}`
              );
            });
          }}
        />
      </div>
    </PayPalScriptProvider>
*?
