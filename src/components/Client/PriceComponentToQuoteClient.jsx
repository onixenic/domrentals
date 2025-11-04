import ContactUsPriceComponentClient from "./ContactUsPriceComponentClient.jsx";
import CheckInCheckOutClient from "./CheckInCheckOutClient.jsx";

export default function PriceComponentToQuoteClient({ propertyId, email, phoneNumber, whatsAppNumber, checkIn, checkOut }) {


    return (
        <div class="card bg-base-100 shadow-xl border border-base-300">
            <div class="card-body">
                <CheckInCheckOutClient
                    checkIn={checkIn}
                    checkOut={checkOut}
                />

                <div class="divider my-1"></div>
                <h3 class="text-xl font-semibold mb-1">Contact host for a price</h3>

                <ContactUsPriceComponentClient
                    propertyId={propertyId}
                    email={email}
                    phoneNumber={phoneNumber}
                    whatsAppNumber={whatsAppNumber}
                />
            </div>
        </div>
    );
}
