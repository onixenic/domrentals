import React, { useState, useMemo, useEffect } from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

export default function BBPriceComponentFixedPlainPlusGuestClient({
                                                           propertyId,
                                                           roomPricing,
                                                           roomDetails,
                                                           currency,
                                                           checkIn,
                                                           checkOut,
                                                           email,
                                                           phoneNumber,
                                                           whatsAppNumber,
                                                         }) {
  const roomNames = Object.keys(roomPricing);
  const [selectedRoom, setSelectedRoom] = useState(roomNames[0]);
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const roomNames = Object.keys(roomPricing);
    if (!roomNames.includes(selectedRoom)) {
      // If the selected room no longer exists or data changed,
      // reset selection to the first available room.
      setSelectedRoom(roomNames[0] ?? "");
      setSelectedGuests(1);
    }
  }, [roomPricing, roomDetails]);

  // Get max guests for the selected room
  const maxGuests = useMemo(() => {
    const room = roomDetails?.find(r => r.name === selectedRoom);
    return room ? room.guests : 1;
  }, [selectedRoom, roomDetails]);

  // Generate guest options
  const guestOptions = useMemo(() => {
    const options = [];
    for (let i = 1; i <= maxGuests; i++) {
      options.push(i);
    }
    return options;
  }, [maxGuests]);

  // Update price whenever room, guests, or roomPricing changes
  useEffect(() => {
    const basePrice = roomPricing[selectedRoom]?.fixedPrice ?? 0;
    const extraPerGuest = roomPricing[selectedRoom]?.extraPerGuest ?? 0;
    const total = basePrice + (selectedGuests - 1) * extraPerGuest;
    setTotalPrice(total);
  }, [selectedRoom, selectedGuests, roomPricing]);

  // Reset guests to 1 when room changes (and ensure it's within max)
  useEffect(() => {
    if (selectedGuests > maxGuests) {
      setSelectedGuests(maxGuests);
    }
  }, [selectedRoom, maxGuests, selectedGuests]);

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
    setSelectedGuests(1); // Reset guests to 1 when room changes
  };

  const handleGuestsChange = (event) => {
    setSelectedGuests(Number(event.target.value));
  };

  return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {/* Price Header */}
          <div id="priceContainer" className="flex items-baseline gap-1">
          <span id="priceValue" className="text-3xl font-bold">
            {totalPrice}
            {currency}
          </span>
            <span className="text-base text-gray-500">/ night*</span>
          </div>

          <div className="divider my-1"></div>

          {/* Room Selector */}
          <div className="flex justify-between text-sm items-center">
            <label htmlFor="roomSelect" className="font-semibold">
              Room
            </label>
            <select
                id="roomSelect"
                className="text-gray-600 border rounded p-1 w-2/3 text-left"
                value={selectedRoom}
                onChange={handleRoomChange}
            >
              {roomNames.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
              ))}
            </select>
          </div>

          {/* Guest Selector */}
          <div className="flex justify-between text-sm items-center">
            <label htmlFor="guestsSelect" className="font-semibold">
              Guests
            </label>
            <select
                id="guestsSelect"
                className="text-gray-600 border rounded p-1 w-2/3 text-left"
                value={selectedGuests}
                onChange={handleGuestsChange}
            >
              {guestOptions.map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
              ))}
            </select>
          </div>

          <div className="divider my-1"></div>

          {/* Check-in/out Info */}
          <CheckInCheckOutClient checkIn={checkIn} checkOut={checkOut} />

          <div className="divider my-1"></div>
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