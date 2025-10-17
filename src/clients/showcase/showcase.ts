export const apartmentConfig = {
  headTitle: "Marina Residence Tangeri",
  title: "Tangeri Residence: Cozy Apartment Main Street",
  location: "Tangeri, Morocco",
  guests: 8,
  bedrooms: 3,
  beds: 5,
  bathrooms: 2,
  imagesByCategory: {
    all: [ //5 images
      "property/showcase/avif/living_room_0.avif",
      "property/showcase/avif/kitchen_0.avif",
      "property/showcase/avif/bedroom_0_1.avif",
      "property/showcase/avif/bathroom_0_0.avif",
      "property/showcase/avif/residence_0.avif"
    ],
    "living room": [
      "property/showcase/avif/living_room_0.avif",
      "property/showcase/avif/living_room_1.avif",
      "property/showcase/avif/living_room_2.avif",
      "property/showcase/avif/living_room_3.avif",
      "property/showcase/avif/living_room_4.avif",
      "property/showcase/avif/living_room_5.avif",
      "property/showcase/avif/living_room_6.avif",
      "property/showcase/avif/living_room_7.avif",
      "property/showcase/avif/living_room_8.avif",

    ],
    kitchen: [
      "property/showcase/avif/kitchen_0.avif",
    ],
    "bedroom 1": [
      "property/showcase/avif/bedroom_0_0.avif",
      "property/showcase/avif/bedroom_0_1.avif",
    ],
    "bedroom 2": [
      "property/showcase/avif/bedroom_1_0.avif",
      "property/showcase/avif/bedroom_1_1.avif"
    ],
    "bedroom 3": [
      "property/showcase/avif/bedroom_2_0.avif",
      "property/showcase/avif/bedroom_2_1.avif",
      "property/showcase/avif/bedroom_2_2.avif"
    ],
    "bathroom 1": [
      "property/showcase/avif/bathroom_0_0.avif",
      "property/showcase/avif/bathroom_0_1.avif",
    ],
    "bathroom 2": [
      "property/showcase/avif/bathroom_1_0.avif",
      "property/showcase/avif/bathroom_1_1.avif",
    ],
    "balcony": [
      "property/showcase/avif/balcony_1.avif",
    ],
    "residence": [
      "property/showcase/avif/residence_0.avif",
      "property/showcase/avif/residence_1.avif",
      "property/showcase/avif/residence_2.avif",
      "property/showcase/avif/residence_3.avif",
      "property/showcase/avif/residence_4.avif"
    ],
    "additional": [
      "property/showcase/avif/other_0.avif",
      "property/showcase/avif/other_1.avif"
    ],
  },
  description: `Located right in the city center, this elegant apartment offers a prime location just steps from the Ibn Battouta Mall and Marina. You'll be surrounded by all essential amenities.

The space features three spacious bedrooms, two bathrooms, a bright living room, a dining area, a fully equipped kitchen, and a special terrace perfect for relaxing outdoors.

This exceptional setting perfectly combines vibrant urban energy with the tranquility of a comfortable home.`,
  houseRules: [
    "No smoking inside the apartment.",
    "No pets allowed.",
    "Check-in after 2 PM, check-out before 11 AM.",
    "Parties and events are not allowed.",
    "Please respect the neighbors and keep noise to a minimum.",
  ],
  price: 120,
  pricePeriods: [
    { from: "2025-10-20", to: "2025-10-25", price: 100 },
    { from: "2025-10-26", to: "2025-10-31", price: 120 },
  ],
  extraPerGuest: 20,
  guestCostBasis: 'perStay',
  currency: "€",
  checkIn: "After 2PM",
  checkOut: "Before 11AM",
  priceCardEmail: "test@gmail.com",
  priceCardPhone: "+39 000 000 0000",
  priceCardWhatsApp: "0390000000000",
  apartmentServices: {
    wifi: true,
    ac: true,
    kitchen: true,
    balcony: true,
    swimming_pool: false,
    free_parking: true,
    wash_machine: true,
    smoke_alarm: true,
    heating: true,
    essentials: true,
    iron: true
  },
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3236.894601500602!2d-5.803961427467321!3d35.777965305361754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzXCsDQ2JzQwLjciTiA1wrA0OCcwOS4zIlc!5e0!3m2!1sit!2sit!4v1760702292229!5m2!1sit!2sit",
  showDirections: true,
  carDirectionsDescription: `Take the main highway (A5) toward Tanger Centre Ville. Follow Avenue Mohammed VI along the waterfront. The apartment is located right next to the Ibn Battouta Mall.`,
  publicTransportDirectionsDescription: `The apartment is a quick 25-30 minute ride by taxi. Official taxis (Grand Taxis) are available outside the terminal (fare is approx. 150-200 MAD).`,
  hostImage: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcScK-0ZMyFB-zb5h3d5QfXsujKK4x8o8uUdZftI22_GWj5YNoUuG3W-IvDUI_dG",
  hostName: "Daniela",
  hostBio: "Managed by Daniela, this property is part of a portfolio dedicated to high-standard accommodations and professional service. We prioritize seamless check-in/out and exceptional cleanliness. Rest easy knowing that all utilities, detailed local guides, and 24/7 guest support are handled by an experienced team. We're here to ensure your focus stays purely on your vacation.",
  hostEmail: "daniela.daniela@gmail.com",
  hostPhone: "+39 3333333333",
  hostLanguages: ["English"]
};