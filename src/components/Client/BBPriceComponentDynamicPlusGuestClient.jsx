import React, { useState, useEffect, useMemo } from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

// --- Utility to format default dates ---
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function BBPriceComponentDynamicPlusGuestClient({
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
    // --- Default dates ---
    const today = useMemo(() => new Date(), []);
    const tomorrow = useMemo(() => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t;
    }, []);

    const [checkInDate, setCheckInDate] = useState(formatDate(today));
    const [checkOutDate, setCheckOutDate] = useState(formatDate(tomorrow));

    const roomNames = Object.keys(roomPricing);
    const [selectedRoom, setSelectedRoom] = useState(roomNames[0] ?? "");
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    // --- Helpers ---
    const getDailyPrice = (dateStr, periods, fixedPrice) => {
        // Handle undefined, null, or non-array periods
        if (!periods || !Array.isArray(periods) || periods.length === 0) {
            console.log(`No periods provided for ${dateStr}, using fixed price: ${fixedPrice}`);
            return fixedPrice || 0;
        }

        // Parse the date string as local date (not UTC)
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        for (const p of periods) {
            // Skip periods with invalid data
            if (!p.from || !p.to) continue;

            // Parse period dates properly
            const [fromYear, fromMonth, fromDay] = p.from.split("-").map(Number);
            const from = new Date(fromYear, fromMonth - 1, fromDay);
            from.setHours(0, 0, 0, 0);

            const [toYear, toMonth, toDay] = p.to.split("-").map(Number);
            const to = new Date(toYear, toMonth - 1, toDay);
            to.setHours(0, 0, 0, 0);

            console.log(`Comparing ${dateStr} with period ${p.from} to ${p.to}:`, date >= from && date <= to);

            if (date >= from && date <= to) {
                console.log(`  -> Using period price: ${p.price}`);
                return p.price;
            }
        }

        // If date is not in any period, use fixed price
        console.log(`  -> Using fixed price: ${fixedPrice}`);
        return fixedPrice || 0;
    };

    const calculateTotalPrice = (roomName, checkInStr, checkOutStr, guestCount) => {
        const room = roomPricing[roomName];
        if (!room || !checkInStr || !checkOutStr) return 0;

        // Parse as local dates
        const [inYear, inMonth, inDay] = checkInStr.split("-").map(Number);
        const checkIn = new Date(inYear, inMonth - 1, inDay);
        const [outYear, outMonth, outDay] = checkOutStr.split("-").map(Number);
        const checkOut = new Date(outYear, outMonth - 1, outDay);

        if (checkOut <= checkIn) return 0;

        const nights = Math.floor((checkOut - checkIn) / MS_PER_DAY);
        let total = 0;

        for (let i = 0; i < nights; i++) {
            const day = new Date(checkIn);
            day.setDate(checkIn.getDate() + i);
            const dayStr = formatDate(day);
            const dayPrice = getDailyPrice(dayStr, room.pricePeriods || [], room.fixedPrice);
            total += dayPrice;
        }

        // --- Extra guest cost logic ---
        const extraGuests = Math.max(0, guestCount - 1);
        if (extraGuests > 0) {
            const extraCost =
                room.guestCostBasis === "perNight"
                    ? extraGuests * room.extraPerGuest * nights
                    : extraGuests * room.extraPerGuest;
            total += extraCost;
        }


        return total;
    };

    // --- Populate guest options for the selected room ---
    const guestOptions = useMemo(() => {
        const details = roomDetails.find((r) => r.name === selectedRoom);
        return details ? Array.from({ length: details.guests }, (_, i) => i + 1) : [];
    }, [selectedRoom, roomDetails]);

    // --- Recalculate price ---
    useEffect(() => {
        if (!selectedRoom || !checkInDate || !checkOutDate) return;
        const total = calculateTotalPrice(selectedRoom, checkInDate, checkOutDate, guests);
        setTotalPrice(total);
        console.log(roomDetails)
    }, [selectedRoom, checkInDate, checkOutDate, guests, roomPricing]);

    // --- Initialize default room if props change ---
    useEffect(() => {
        const firstRoom = Object.keys(roomPricing)[0];
        if (firstRoom && !selectedRoom) setSelectedRoom(firstRoom);
    }, [roomPricing]);

    // --- Handlers ---
    function handleCheckInChange(e) {
        const newCheckInDate = e.target.value;
        setCheckInDate(newCheckInDate);

        const checkInDt = new Date(newCheckInDate);
        const checkOutDt = new Date(checkOutDate);

        if (checkInDt >= checkOutDt) {
            const newCheckOut = new Date(checkInDt);
            newCheckOut.setDate(newCheckOut.getDate() + 1);
            setCheckOutDate(formatDate(newCheckOut));
        }
    }

    function handleCheckOutChange(e) {
        setCheckOutDate(e.target.value);
    }

    function handleRoomChange(e) {
        const newRoom = e.target.value;
        setSelectedRoom(newRoom);
        setGuests(1);
    }

    function handleGuestChange(e) {
        setGuests(Number(e.target.value));
    }

    // --- Render ---
    return (
        <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
                {/* Price header */}
                <div className="flex items-baseline gap-1">
          <span id="price-text" className="text-3xl font-bold">
            {totalPrice.toFixed(2)} {currency}
          </span>
                    <span className="text-base text-gray-500">/ stay*</span>
                </div>

                <div className="divider my-2"></div>

                {/* Dates */}
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
                            onChange={handleCheckInChange}
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
                            className="text-gray-600 border rounded p-1 w-2/3 text-right"
                            onChange={handleCheckOutChange}
                            min={checkInDate}
                        />
                    </div>

                    <div className="divider my-2"></div>

                    {/* Room selector */}
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

                    {/* Guest selector */}
                    <div className="flex justify-between text-sm items-center">
                        <label htmlFor="guestsSelect" className="font-semibold">
                            Guests
                        </label>
                        <select
                            id="guestsSelect"
                            className="text-gray-600 border rounded p-1 w-2/3 text-left"
                            value={guests}
                            onChange={handleGuestChange}
                        >
                            {guestOptions.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="divider my-2"></div>

                <CheckInCheckOutClient checkIn={checkIn} checkOut={checkOut} />

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
