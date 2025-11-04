import React, {useEffect, useState, useMemo} from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

// --- Start Date Formatting Utility ---
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const checkInDateDefault = formatDate(today);
const checkOutDateDefault = formatDate(tomorrow);
// --- End Date Formatting Utility ---

export default function PriceComponentDynamicPlusGuestClient({
                                                               propertyId,
                                                               price,
                                                               pricePeriods,
                                                               currency,
                                                               checkIn,
                                                               checkOut,
                                                               email,
                                                               phoneNumber,
                                                               whatsAppNumber,
                                                               guests,
                                                               extraPerGuest,
                                                               guestCostBasis,
                                                             }) {
  const [checkInDate, setCheckInDate] = useState(checkInDateDefault);
  const [checkOutDate, setCheckOutDate] = useState(checkOutDateDefault);
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [displayedPrice, setDisplayedPrice] = useState("");
  const [extraChargeNotice, setExtraChargeNotice] = useState("");

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const state = useMemo(
      () => ({
        basePrice: Number(price),
        currency,
        pricePeriods: pricePeriods || [],
        extraPerGuest: Number(extraPerGuest),
        maxGuests: Number(guests),
        guestCostBasis,
      }),
      [price, currency, pricePeriods, extraPerGuest, guests, guestCostBasis]
  );

  // --- Utility Functions ---
  const formatDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getNextDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return formatDateStr(date);
  };

  const getDailyPrice = (date) => {
    for (const period of state.pricePeriods) {
      const fromDate = new Date(period.from);
      const toDate = new Date(period.to);
      if (date >= fromDate && date <= toDate) return period.price;
    }
    return state.basePrice;
  };

  const calculateTotalPrice = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr)
      return {total: state.basePrice, nights: 0};

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn)
      return {total: state.basePrice, nights: 0};

    const nights = Math.round((checkOut - checkIn) / MS_PER_DAY);
    let total = 0;

    for (let i = 0; i < nights; i++) {
      const day = new Date(checkIn);
      day.setDate(checkIn.getDate() + i);
      total += getDailyPrice(day);
    }

    return {total, nights};
  };

  const calculateGuestSurcharge = (selectedGuests, nights) => {
    const extraGuests = Math.max(selectedGuests - 1, 0);
    const extra = Number(state.extraPerGuest) || 0;

    if (state.guestCostBasis === "perNight") {
      return extraGuests * extra * nights;
    } else {
      return extraGuests * extra;
    }
  };

  // --- Price Calculation ---
  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setDisplayedPrice(`${state.currency}`);
      return;
    }

    const {total: datesTotal, nights} = calculateTotalPrice(checkInDate, checkOutDate);
    const guestSurcharge = calculateGuestSurcharge(selectedGuests, nights);
    const finalTotal = datesTotal + guestSurcharge;

    setDisplayedPrice(`${finalTotal.toFixed(2)} ${state.currency}`);
  }, [checkInDate, checkOutDate, selectedGuests, state]);

  // --- Handlers ---
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    const nextDay = getNextDay(newCheckIn);
    setCheckInDate(newCheckIn);

    if (!checkOutDate || new Date(checkOutDate) <= new Date(newCheckIn)) {
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutChange = (e) => setCheckOutDate(e.target.value);

  const handleGuestsChange = (e) => setSelectedGuests(Number(e.target.value));

  return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex items-baseline gap-1">
          <span id="price-text" className="text-3xl font-bold">
            {displayedPrice || currency}
          </span>
            <span className="text-base text-gray-500">/ stay*</span>
          </div>

          <div className="divider my-2"></div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <label htmlFor="checkIn-input" className="font-semibold">
                Check-in
              </label>
              <input
                  type="date"
                  id="checkIn-input"
                  value={checkInDate}
                  className="text-gray-600 border rounded p-1 w-2/3 text-right"
                  min={checkInDateDefault}
                  onChange={handleCheckInChange}
              />
            </div>

            <div className="flex justify-between text-sm items-center">
              <label htmlFor="checkOut-input" className="font-semibold">
                Check-out
              </label>
              <input
                  type="date"
                  id="checkOut-input"
                  value={checkOutDate}
                  className="text-gray-600 border rounded p-1 w-2/3 text-right"
                  min={getNextDay(checkInDate)}
                  onChange={handleCheckOutChange}
              />
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between text-sm items-center">
            <label htmlFor="guests-input" className="font-semibold">
              Guests
            </label>
            <select
                id="guests-input"
                className="text-gray-600 border rounded p-1 w-2/3 text-left"
                value={selectedGuests}
                onChange={handleGuestsChange}
            >
              {Array.from({length: state.maxGuests}, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
              ))}
            </select>
          </div>

          <div className="divider my-2"></div>

          <CheckInCheckOutClient checkIn={checkIn} checkOut={checkOut}/>

          <div className="divider my-2"></div>

          <h3 className="text-xl font-semibold mb-1">Contact your host</h3>
          <ContactUsPriceComponentClient
              propertyId={propertyId}
              email={email}
              phoneNumber={phoneNumber}
              whatsAppNumber={whatsAppNumber}
          />

          <p className="text-xs text-gray-500 my-1">
            *Price and availability must be confirmed by the host
          </p>
        </div>
      </div>
  );
}
