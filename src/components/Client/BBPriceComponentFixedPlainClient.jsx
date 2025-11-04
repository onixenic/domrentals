import React, { useState } from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

export default function BBPriceComponentFixedPlainClient({
                                                  propertyId,
                                                  roomPricing,
                                                  currency,
                                                  checkIn,
                                                  checkOut,
                                                  email,
                                                  phoneNumber,
                                                  whatsAppNumber,
                                                }) {
  const roomNames = Object.keys(roomPricing);
  const [selectedRoom, setSelectedRoom] = useState(roomNames[0]);

  const handleRoomChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const currentPrice = roomPricing[selectedRoom]?.fixedPrice  ?? 0;

  return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {/* Price Header */}
          <div id="priceContainer" className="flex items-baseline gap-1">
          <span id="priceValue" className="text-3xl font-bold">
            {currentPrice}
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
