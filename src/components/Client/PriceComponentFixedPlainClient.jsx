import React from "react";
import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient";
import CheckInCheckOutClient from "./CheckInCheckOutClient";

export default function PriceComponentToQuoteClient({
                                                        propertyId,
                                                        price,
                                                        currency,
                                                        checkIn,
                                                        checkOut,
                                                        email,
                                                        phoneNumber,
                                                        whatsAppNumber,
                                                    }) {
    return (
        <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
                {/* Price Header */}
                <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            <span className="preview-price">{price}</span>
            <span className="preview-currency">{currency}</span>
          </span>
                    <span className="text-base text-gray-500">/ night*</span>
                </div>

                <div className="divider my-1"></div>

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
