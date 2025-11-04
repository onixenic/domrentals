import React, {useState, useEffect} from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

export default function PriceComponentFixedPlainPlusGuestClient({
                                                                  propertyId,
                                                                  price,
                                                                  currency,
                                                                  checkIn,
                                                                  checkOut,
                                                                  email,
                                                                  phoneNumber,
                                                                  whatsAppNumber,
                                                                  guests,
                                                                  extraPerGuest = 0,
                                                                  guestCostBasis,
                                                                }) {
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [extraChargeNotice, setExtraChargeNotice] = useState("");

  // Compute total price
  const totalPrice =
      guestCostBasis === "perStay"
          ? price
          : price + Math.max(selectedGuests - 1, 0) * extraPerGuest;

  // Update notice when props change
  useEffect(() => {
    if (guestCostBasis === "perStay" && extraPerGuest) {
      setExtraChargeNotice(
          `* An extra charge of ${extraPerGuest}${currency} will be added per person per stay`
      );
    } else {
      setExtraChargeNotice("");
    }
  }, [guestCostBasis, extraPerGuest, currency]);

  const handleGuestChange = (event) => {
    setSelectedGuests(Number(event.target.value));
  };

  return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {/* Price Header */}
          <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-1">
            <span id="price-text" className="text-3xl font-bold">
              {totalPrice}
              {currency}
            </span>
              <span className="text-base text-gray-500">
               / night*
            </span>
            </div>

            {/* Extra charge notice below */}
            {extraChargeNotice && (
                <p className="text-xs text-gray-500 mt-1 ml-0.5">
                  {extraChargeNotice}
                </p>
            )}
          </div>

          {/* Guest selector (only if perNight) */}
          {guestCostBasis === "perNight" && (
              <>
                <div className="divider my-1"/>

                <div className="flex justify-between text-sm items-center">
                  <label htmlFor="guests" className="font-semibold">
                    Guests
                  </label>
                  <select
                      id="guests"
                      className="text-gray-600 border rounded p-1 w-2/3 text-left"
                      onChange={handleGuestChange}
                      value={selectedGuests}
                  >
                    {Array.from({length: guests}, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                    ))}
                  </select>
                </div>
              </>
          )}

          <div className="divider my-1"/>

          <CheckInCheckOutClient checkIn={checkIn} checkOut={checkOut}/>

          <div className="divider my-1"/>
          <h3 className="text-xl font-semibold mb-1">Contact your host</h3>

          <ContactUsPriceComponentClient
              propertyId={propertyId}
              email={email}
              phoneNumber={phoneNumber}
              whatsAppNumber={whatsAppNumber}
          />

          {/* Price confirmation notice */}
          <p className="text-xs text-gray-500 my-1">
            *Price must be confirmed by the host
          </p>
        </div>
      </div>
  );
}