import React from "react";

export default function CheckInCheckOutClient({checkIn, checkOut}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="font-semibold">Check-in</span>
                <span className="text-gray-600">{checkIn}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="font-semibold">Check-out</span>
                <span className="text-gray-600">{checkOut}</span>
            </div>
        </div>
    );
}