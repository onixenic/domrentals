export const buildPropertyConfig = ({
                                      propertyType,
                                      pricingType,
                                      pricing,
                                      propertyId,
                                      propertyPsw,
                                      hostType,
                                      companyName,
                                      companyAddress,
                                      companyVat,
                                      companyRep,
                                      companyEmail,
                                      individualName,
                                      individualAddress,
                                      individualTaxId,
                                      individualEmail,
                                      title,
                                      location,
                                      guests,
                                      bedrooms,
                                      beds,
                                      bathrooms,
                                      checkin,
                                      checkout,
                                      houseRules,
                                      selectedServices,
                                      additionalServices,
                                      hostDescription,
                                      languages,
                                      bbRooms,
                                      breakfastIncluded,
                                      breakfastAvailable,
                                      breakfastCost,
                                      showDirections,
                                      pricePeriods,
                                      email,
                                      phone,
                                      formatTimeForDisplay,
                                    }) => {
  const apartmentServices = {};
  Object.entries(selectedServices).forEach(([key, value]) => {
    if (value) apartmentServices[key] = true;
  });

  const hostEmail = hostType === 'company' ? companyEmail : individualEmail;

  const commonFields = {
    propertyId,
    propertyPsw,
    hostType,
    companyName: hostType === 'company' ? companyName || null : null,
    companyAddress: hostType === 'company' ? companyAddress || null : null,
    companyVat: hostType === 'company' ? companyVat || null : null,
    companyRep: hostType === 'company' ? companyRep || null : null,
    individualName: hostType === 'individual' ? individualName || null : null,
    individualAddress: hostType === 'individual' ? individualAddress || null : null,
    individualTaxId: hostType === 'individual' ? individualTaxId || null : null,
    hostEmail,
    headTitle: title,
    title,
    location,
    imagesMainPage: null,
    imagesThumbnail: null,
    imagesByCategory: null,
    description: null,
    houseRules: houseRules.split('\n'),
    checkIn: formatTimeForDisplay(checkin, 'checkin') || null,
    checkOut: formatTimeForDisplay(checkout, 'checkout') || null,
    email,
    phoneNumber: phone || null,
    whatsAppNumber: null,
    apartmentServices,
    additionalServices: additionalServices || null,
    mapEmbed: null,
    showDirections: showDirections || null,
    carDirectionsDescription: null,
    publicTransportDirectionsDescription: null,
    hostImage: null,
    hostName: null,
    hostBio: hostDescription || null,
    hostLanguages: languages || null,
  };

  if (propertyType === 'apartment') {
    let price = null;
    let pricePeriods_ = null;
    let extraPerGuest = null;
    let guestCostBasis = null;
    let currency = null;

    const roomPricing = pricing[0];

    if (pricingType === 'fixedAllYear' || pricingType === 'fixedExtraGuests') {
      price = roomPricing?.fixedPrice || null;
      currency = roomPricing?.currency || null;
    }

    if (pricingType === 'fixedExtraGuests' || pricingType === 'dynamicDatesExtraGuests') {
      extraPerGuest = roomPricing?.extraPerGuest || null;
      guestCostBasis = roomPricing?.extraPerGuestType || null;
    }

    if (pricingType === 'dynamicDates' || pricingType === 'dynamicDatesExtraGuests') {
      currency = roomPricing?.currency || null;
      pricePeriods_ = pricePeriods['apartment'] || [];
    }

    if ((pricingType === 'fixedAllYear' || pricingType === 'fixedExtraGuests') && !price) {
      throw new Error('Please enter a price for the fixed pricing option');
    }

    if ((pricingType === 'fixedAllYear' || pricingType === 'fixedExtraGuests') && !currency) {
      throw new Error('Please select a currency');
    }

    if ((pricingType === 'fixedExtraGuests' || pricingType === 'dynamicDatesExtraGuests') && extraPerGuest === null) {
      throw new Error('Please enter the extra per guest amount');
    }

    return {
      ...commonFields,
      guests,
      bedrooms,
      beds,
      bathrooms,
      price,
      pricePeriods: pricePeriods_,
      extraPerGuest,
      guestCostBasis,
      currency,
    };
  } else if (propertyType === 'bb') {
    if (bbRooms.length === 0) {
      throw new Error('Please add at least one room');
    }

    const roomDetails = bbRooms.map((room, index) => ({
      roomName: room.name || `Room ${index + 1}`,
      guests: Number(room.guests),
      beds: Number(room.beds),
      bathrooms: Number(room.bathrooms),
      privateBathroom: room.privateBathroom || false,
    }));

    const roomPricing = {};
    bbRooms.forEach((room, index) => {
      const roomName = room.name || `Room ${index + 1}`;
      const pricingData = pricing[roomName] || {
        fixedPrice: 0,
        currency: '€',
        extraPerGuest: 0,
        extraPerGuestType: 'perStay',
      };

      roomPricing[roomName] = {
        price: pricingType === 'fixedAllYear' || pricingType === 'fixedExtraGuests' ? pricingData.fixedPrice : null,
        pricePeriods: pricingType === 'dynamicDates' || pricingType === 'dynamicDatesExtraGuests'
            ? pricePeriods[roomName] || []
            : [],
        extraPerGuest: pricingData.extraPerGuest || 0,
        guestCostBasis: pricingData.extraPerGuestType || 'perStay',
      };
    });

    const currency = pricing[0]?.currency || null;

    return {
      ...commonFields,
      rooms: bbRooms.length,
      breakFastIncluded: breakfastIncluded,
      breakFastAvailable: breakfastAvailable,
      breakFastCost: breakfastCost || null,
      roomDetails,
      roomPricing,
      currency,
    };
  }

  throw new Error('Invalid property type');
};

// ============================================
// Download Config as JSON
// ============================================
export const downloadConfig = (configData, propertyType, propertyId) => {
  try {
    const json = buildPropertyConfig(configData);

    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${propertyType}-${propertyId || 'config'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

// ============================================
// Upload Config to Firebase
// ============================================
export const uploadConfigToFirebase = async (configData, propertyType, propertyId, uploadPhoto) => {
  try {
    const json = buildPropertyConfig(configData);

    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });

    const file = new File(
        [blob],
        `${propertyType}-${propertyId || 'config'}.json`,
        { type: 'application/json' }
    );

    // Upload to Firebase
    await uploadPhoto(file, propertyId);

    return { success: true, message: 'Data uploaded successfully!' };
  } catch (error) {
    throw error;
  }
};