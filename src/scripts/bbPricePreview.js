// bbPricePreviewUpdate.js

function initBBPricePreview() {
    const bbPreviewSection = document.getElementById("bb-price-preview-inline");
    const pricingRadios = document.querySelectorAll('input[name="pricingType"]');
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const bbRoomsContainer = document.getElementById("bb-rooms-container");
    const form = document.getElementById("config-form");

    let propertyType = "apartment";

    // Track property type
    typeRadios.forEach(radio => {
        if (radio.checked) propertyType = radio.value;
        radio.addEventListener("change", () => {
            propertyType = radio.value;
            updatePreview();
        });
    });

    // Function to gather current form data
    function gatherFormData() {
        const formData = new FormData(form);
        const pricingType = formData.get("pricingType");

        // Get room details
        const roomDetails = [];
        const roomPricing = {};

        Array.from(bbRoomsContainer.children).forEach((roomDiv, roomIndex) => {
            const nameInput = roomDiv.querySelector('input[name*="[name]"]');
            const guestsInput = roomDiv.querySelector('input[name*="[guests]"]');
            const bedsInput = roomDiv.querySelector('input[name*="[beds]"]');
            const bathroomsInput = roomDiv.querySelector('input[name*="[bathrooms]"]');
            const privateBathroomInput = roomDiv.querySelector('input[name*="[privateBathroom]"]');

            const roomName = nameInput?.value || `Room ${roomIndex + 1}`;

            roomDetails.push({
                roomName,
                guests: Number(guestsInput?.value) || 0,
                beds: Number(bedsInput?.value) || 0,
                bathrooms: Number(bathroomsInput?.value) || 0,
                privateBathroom: privateBathroomInput?.checked || false,
            });

            // Get pricing for this room
            let price = null;
            let extraPerGuest = null;
            let guestCostBasis = "perStay";

            if (pricingType === "fixedAllYear" || pricingType === "fixedExtraGuests") {
                const priceInput = document.querySelector(`input[name="pricing[${roomIndex}][fixedPrice]"]`);
                price = priceInput ? Number(priceInput.value) || 0 : 0;
            }

            if (pricingType === "fixedExtraGuests" || pricingType === "dynamicDatesExtraGuests") {
                const extraInput = document.querySelector(`input[name="pricing[${roomIndex}][extraPerGuest]"]`);
                const typeSelect = document.querySelector(`select[name="pricing[${roomIndex}][extraPerGuestType]"]`);
                extraPerGuest = extraInput ? Number(extraInput.value) || 0 : 0;
                guestCostBasis = typeSelect ? typeSelect.value : "perStay";
            }

            roomPricing[roomName] = {
                price: price || 0,
                pricePeriods: [],
                extraPerGuest: extraPerGuest || 0,
                guestCostBasis: guestCostBasis,
            };
        });

        const currencySelect = document.querySelector(`select[name="pricing[0][currency]"]`);
        const currency = currencySelect ? currencySelect.value : "EUR";

        return {
            pricingType,
            roomDetails,
            roomPricing,
            currency,
        };
    }

    // Main update function
    function updatePreview() {
        if (propertyType !== "bb") {
            bbPreviewSection.classList.add("hidden");
            return;
        }

        const hasRooms = bbRoomsContainer.children.length > 0;
        if (!hasRooms) {
            bbPreviewSection.classList.add("hidden");
            return;
        }

        bbPreviewSection.classList.remove("hidden");

        const data = gatherFormData();
        const { pricingType } = data;

        // Hide all preview components
        document.querySelectorAll('[id^="preview-"]').forEach(el => {
            el.classList.add('hidden');
        });

        // Show selected component
        const selectedPreview = document.getElementById(`preview-${pricingType}`);
        if (selectedPreview) {
            selectedPreview.classList.remove('hidden');

            // Call the global update function that the component exposes
            const updateFnName = `updatePreview_${pricingType}`;
            if (window[updateFnName]) {
                window[updateFnName](data);
            }
        }
    }

    // Listen to all relevant changes
    pricingRadios.forEach(radio => {
        radio.addEventListener("change", updatePreview);
    });

    // Listen to room changes
    const observer = new MutationObserver(updatePreview);
    observer.observe(bbRoomsContainer, { childList: true, subtree: true });

    // Listen to form input changes (for live updates)
    form.addEventListener("input", debounce(updatePreview, 300));

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initial update
    updatePreview();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBBPricePreview);
} else {
    initBBPricePreview();
}