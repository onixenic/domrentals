function updatePreview() {


    const apartmentPriceComponentToQuoteContainer = document.getElementById('apartment-price-component-to-quote');
    const apartmentPriceComponentFixedPlainContainer = document.getElementById('apartment-price-component-fixed-plain');
    const apartmentPriceComponentFixedPlainPlusGuestContainer = document.getElementById('apartment-price-component-fixed-plain-plus-guest');
    const apartmentPriceComponentDynamicContainer = document.getElementById('apartment-price-component-dynamic');
    const apartmentPriceComponentDynamicPlusGuestContainer = document.getElementById('apartment-price-component-dynamic-plus-guest');


    const propertyApartmentRadio = document.getElementById('property-type-apartment');
    const pricingContactHostRadio = document.getElementById('pricing-contact-host');
    const pricingFixedRadio = document.getElementById('pricing-fixed-all-year');
    const pricingFixedExtraGuestsRadio = document.getElementById('pricing-fixed-extra-guests');
    const pricingDynamicDatesRadio = document.getElementById('pricing-dynamic-dates');
    const pricingDynamicDatesExtraGuestsRadio = document.getElementById('pricing-dynamic-dates-extra-guests');

    console.log(pricingDynamicDatesExtraGuestsRadio.checked)

    if (propertyApartmentRadio.checked && pricingContactHostRadio.checked) {
        apartmentPriceComponentToQuoteContainer.classList.remove('hidden');
    } else {
        apartmentPriceComponentToQuoteContainer.classList.add('hidden');
    }

    if (propertyApartmentRadio.checked && pricingFixedRadio.checked) {
        apartmentPriceComponentFixedPlainContainer.classList.remove('hidden');
    } else {
        apartmentPriceComponentFixedPlainContainer.classList.add('hidden');
    }

    if (propertyApartmentRadio.checked && pricingFixedExtraGuestsRadio.checked) {
        apartmentPriceComponentFixedPlainPlusGuestContainer.classList.remove('hidden');
    } else {
        apartmentPriceComponentFixedPlainPlusGuestContainer.classList.add('hidden');
    }

    if (propertyApartmentRadio.checked && pricingDynamicDatesRadio.checked) {
        apartmentPriceComponentDynamicContainer.classList.remove('hidden');
    } else {
        apartmentPriceComponentDynamicContainer.classList.add('hidden');
    }


    if (propertyApartmentRadio.checked && pricingDynamicDatesExtraGuestsRadio.checked) {
        apartmentPriceComponentDynamicPlusGuestContainer.classList.remove('hidden');
    } else {
        apartmentPriceComponentDynamicPlusGuestContainer.classList.add('hidden');
    }

    if (propertyApartmentRadio.checked && (pricingContactHostRadio.checked || pricingFixedRadio.checked || pricingFixedExtraGuestsRadio.checked || pricingDynamicDatesRadio.checked || pricingDynamicDatesExtraGuestsRadio.checked)) {
        // For apartments, use roomIndex = 0
        const roomIndex = 0;
        const priceInput = document.getElementById(`fixed-price-input-${roomIndex}`);
        const currencySelect = document.getElementById(`currency-select-${roomIndex}`);
        const guestsInput = document.getElementById(`guests`);
        const checkInInput = document.getElementById('checkin');
        const checkOutInput = document.getElementById('checkout');
        const checkInInputDate = document.getElementById('checkIn-input');
        const checkOutInputDate = document.getElementById('checkOut-input');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');


        document.querySelectorAll('.preview-checkIn').forEach(el => {
            el.textContent = "After " + checkInInput?.value
        });
        document.querySelectorAll('.preview-checkOut').forEach(el => {
            el.textContent = "Before " + checkOutInput?.value
        });
        document.querySelectorAll('.preview-email-value').forEach(el => {
            el.textContent = emailInput?.value
        });
        document.querySelectorAll('.preview-phone-value').forEach(el => {
            el.textContent = phoneInput?.value
        });

        const emailLink = document.getElementById('preview-email');
        const phoneLink = document.getElementById('preview-phone');
        const whatsAppLink = document.getElementById('preview-whatsapp-link');

        emailLink.href = `mailto:${emailInput?.value}`;
        phoneLink.href = `tel:${phoneInput?.value}`;
        whatsAppLink.href = `https://wa.me/${phoneInput?.value.replace(/^\+/, '00')}`;

        if (pricingFixedRadio.checked) {
            document.querySelectorAll('.preview-price').forEach(el => {
                el.textContent = parseFloat(priceInput?.value || 0).toFixed(2);
            });
            document.querySelectorAll('.preview-currency').forEach(el => {
                el.textContent = currencySelect?.value || '€'
            });
        }


        if (pricingFixedExtraGuestsRadio.checked) {
            const extraGuestInput = document.getElementById(`extra-guest-input-${roomIndex}`);
            const extraGuestTypeSelect = document.getElementById(`extra-guest-type-${roomIndex}`);
            const previewPriceComponentFixedPlainPlusGuest = document.getElementById('preview-price-component-fixed-plain-plus-guest');

            previewPriceComponentFixedPlainPlusGuest.dataset.price = priceInput?.value || '0.00';
            previewPriceComponentFixedPlainPlusGuest.dataset.currency = currencySelect?.value || '€';
            previewPriceComponentFixedPlainPlusGuest.dataset.extraPerGuest = extraGuestInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.guests = guestsInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.guestCostBasis = extraGuestTypeSelect?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.checkIn = checkInInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.checkOut = checkOutInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.email = emailInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.phoneNumber = phoneInput?.value;
            previewPriceComponentFixedPlainPlusGuest.dataset.whatsAppNumber = phoneInput?.value;
        }

        if (pricingDynamicDatesRadio.checked) {
            const previewPriceComponentDynamic = document.getElementById('preview-price-component-dynamic');
            previewPriceComponentDynamic.dataset.currency = currencySelect?.value || '€';
            previewPriceComponentDynamic.dataset.initialCheckin = checkInInputDate?.value;
            previewPriceComponentDynamic.dataset.initialCheckout = checkOutInputDate?.value;
            previewPriceComponentDynamic.dataset.email = emailInput?.value;
            previewPriceComponentDynamic.dataset.phoneNumber = phoneInput?.value;
            previewPriceComponentDynamic.dataset.whatsAppNumber = phoneInput?.value;
        }

        if (pricingDynamicDatesExtraGuestsRadio.checked) {
            const extraGuestInput = document.getElementById(`extra-guest-input-${roomIndex}`);
            const extraGuestTypeSelect = document.getElementById(`extra-guest-type-${roomIndex}`);
            const previewPriceComponentDynamicPlusGuest = document.getElementById('preview-price-component-dynamic-plus-guest');

            previewPriceComponentDynamicPlusGuest.dataset.currency = currencySelect?.value || '€';
            previewPriceComponentDynamicPlusGuest.dataset.initialCheckin = checkInInputDate?.value || '';
            previewPriceComponentDynamicPlusGuest.dataset.initialCheckout = checkOutInputDate?.value || '';
            previewPriceComponentDynamicPlusGuest.dataset.extraPerGuest = extraGuestInput?.value || '0';
            previewPriceComponentDynamicPlusGuest.dataset.maxGuests = guestsInput?.value || '1';
            previewPriceComponentDynamicPlusGuest.dataset.guestCostBasis = extraGuestTypeSelect?.value || 'perNight';
            previewPriceComponentDynamicPlusGuest.dataset.email = emailInput?.value || '';
            previewPriceComponentDynamicPlusGuest.dataset.phoneNumber = phoneInput?.value || '';
            previewPriceComponentDynamicPlusGuest.dataset.whatsAppNumber = phoneInput?.value || '';
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const propertyApartmentRadio = document.getElementById('property-type-apartment');
    const propertyBBRadio = document.getElementById('property-type-bb');
    const pricingContactRadio = document.getElementById('pricing-contact-host');
    const pricingFixedRadio = document.getElementById('pricing-fixed-all-year');
    const pricingFixedGuestsRadio = document.getElementById('pricing-fixed-extra-guests');
    const pricingDynamicRadio = document.getElementById('pricing-dynamic-dates');
    const pricingDynamicGuestsRadio = document.getElementById('pricing-dynamic-dates-extra-guests');

    const guestsInput = document.getElementById('guests');
    const checkInInput = document.getElementById('checkin');
    const checkOutInput = document.getElementById('checkout');
    const checkInDateInput = document.getElementById('checkIn-input');
    const checkOutDateInput = document.getElementById('checkOut-input');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const apartmentPricingContent = document.getElementById('apartment-pricing-content');

    // Update on property type change
    propertyApartmentRadio.addEventListener('change', updatePreview);
    propertyBBRadio.addEventListener('change', updatePreview);

    // Update on pricing type change
    pricingContactRadio.addEventListener('change', updatePreview);
    pricingFixedRadio.addEventListener('change', updatePreview);
    pricingFixedGuestsRadio.addEventListener('change', updatePreview);
    pricingDynamicRadio.addEventListener('change', updatePreview);
    pricingDynamicGuestsRadio.addEventListener('change', updatePreview);

    // Update on time and contact input changes
    guestsInput?.addEventListener('change', updatePreview);
    checkInInput?.addEventListener('change', updatePreview);
    checkOutInput?.addEventListener('change', updatePreview);
    emailInput?.addEventListener('input', updatePreview);
    phoneInput?.addEventListener('input', updatePreview);
    checkInDateInput?.addEventListener('change', updatePreview);
    checkOutDateInput?.addEventListener('change', updatePreview);

    // Use event delegation for dynamically created inputs from template
    apartmentPricingContent.addEventListener('input', (e) => {
        // Match IDs like: fixed-price-input-0, extra-guest-input-0, etc
        if (e.target.id?.startsWith('fixed-price-input-') ||
            e.target.id?.startsWith('extra-guest-input-')) {
            updatePreview();
        }
    });

    apartmentPricingContent.addEventListener('change', (e) => {
        // Match IDs like: currency-select-0, extra-guest-type-0
        if (e.target.id?.startsWith('currency-select-') ||
            e.target.id?.startsWith('extra-guest-type-')) {
            updatePreview();
        }
    });

    apartmentPricingContent.addEventListener('input', updatePreview);
    apartmentPricingContent.addEventListener('change', updatePreview);

    // Initial update
    updatePreview();
});