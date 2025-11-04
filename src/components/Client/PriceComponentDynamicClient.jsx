import React, { useState, useEffect } from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PriceComponentDynamicClient({
                                                      propertyId,
                                                      price,
                                                      pricePeriods,
                                                      currency,
                                                      checkIn,
                                                      checkOut,
                                                      email,
                                                      phoneNumber,
                                                      whatsAppNumber,
                                                    }) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [checkInDate, setCheckInDate] = useState(formatDate(today));
  const [checkOutDate, setCheckOutDate] = useState(formatDate(tomorrow));
  const [totalPrice, setTotalPrice] = useState(price);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Ensure pricePeriods is always an array
  const periodsList = Array.isArray(pricePeriods) ? pricePeriods : [];

  function getDailyPrice(date) {
    // Guard against empty or invalid periods
    if (!periodsList || periodsList.length === 0) {
      return price || 0;
    }

    for (const period of periodsList) {
      // Skip invalid periods
      if (!period.from || !period.to) continue;

      const from = new Date(period.from);
      const to = new Date(period.to);

      // Check if dates are valid
      if (isNaN(from) || isNaN(to)) continue;

      if (date >= from && date <= to) {
        return period.price || 0;
      }
    }

    return price || 0;
  }

  function calculateTotalPrice(checkInStr, checkOutStr) {
    if (!checkInStr || !checkOutStr) return price;

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) return price;

    const nights = Math.round((checkOutDate - checkInDate) / MS_PER_DAY);
    let total = 0;

    for (let i = 0; i < nights; i++) {
      const day = new Date(checkInDate);
      day.setDate(checkInDate.getDate() + i);
      total += getDailyPrice(day);
    }

    return total;
  }

  function getNextDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return formatDate(date);
  }

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(checkInDate, checkOutDate));
  }, [checkInDate, checkOutDate, periodsList, price]);

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    const nextDay = getNextDay(newCheckIn);
    setCheckInDate(newCheckIn);

    // auto-adjust checkout if invalid
    if (!checkOutDate || new Date(checkOutDate) <= new Date(newCheckIn)) {
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutChange = (e) => {
    setCheckOutDate(e.target.value);
  };

  return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {/* Price Header */}
          <div className="flex items-baseline gap-1">
                    <span id="price-text" className="text-3xl font-bold">
                        {totalPrice.toFixed(2)} {currency}
                    </span>
            <span className="text-base text-gray-500">/ stay*</span>
          </div>

          <div className="divider my-1"></div>

          {/* Date Inputs */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <label htmlFor="checkIn-input" className="font-semibold">
                Check-in
              </label>
              <input
                  type="date"
                  id="checkIn-input"
                  value={checkInDate}
                  onChange={handleCheckInChange}
                  className="text-gray-600 border rounded p-1 w-2/3 text-right"
                  min={formatDate(today)}
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
                  onChange={handleCheckOutChange}
                  className="text-gray-600 border rounded p-1 w-2/3 text-right"
                  min={getNextDay(checkInDate)}
              />
            </div>

            <div className="divider my-1"></div>

            <CheckInCheckOutClient checkIn={checkIn} checkOut={checkOut} />
          </div>

          <div className="divider my-1"></div>

          {/* Contact Section */}
          <h3 className="text-xl font-semibold mb-1">Contact your host</h3>
          <ContactUsPriceComponentClient
              propertyId={propertyId}
              email={email}
              phoneNumber={phoneNumber}
              whatsAppNumber={whatsAppNumber}
          />

          {/* Notice */}
          <p className="text-xs text-gray-500 my-1">
            *Price and availability must be confirmed by the host
          </p>
        </div>
      </div>
  );
}