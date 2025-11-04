export const bbConfig = {
  propertyId: "00",
  propertyPsw: "99223",
  headTitle: "B&B Daniela",
  title: "B&B Daniela",
  location: "Grand Rapids, USA",
  rooms: 2,
  breakFastIncluded: false,
  breakFastAvailable: true,
  breakFastCost: "10",
  roomDetails: [
    {
      roomName: "Room1",
      guests: 5,
      beds: 1,
      bathrooms: 1,
      privateBathroom: true,
    },
    {
      roomName: "Room2",
      guests: 2,
      beds: 1,
      bathrooms: 1,
      privateBathroom: true
    }
  ],
  imagesMainPage: [
    "property/showcase_bb/avif/600/shared_space_01.avif",
    "property/showcase_bb/avif/600/shared_space_04.avif",
    "property/showcase_bb/avif/600/room1_0.avif",
    "property/showcase_bb/avif/600/room2_0.avif",
    "property/showcase_bb/avif/600/room2_1.avif"
  ],
  imagesThumbnail: {
    "Shared space": [
      "property/showcase_bb/avif/200/shared_space_01.avif"
    ],
    "room 1": [
      "property/showcase_bb/avif/200/room1_0.avif"
    ],
    "room 2": [
      "property/showcase_bb/avif/200/room2_0.avif"
    ],
    "additional": [
      "property/showcase_bb/avif/200/other_0.avif"
    ]
  },
  imagesByCategory: {
    "Shared space": [
      "property/showcase_bb/avif/shared_space_01.avif",
      "property/showcase_bb/avif/shared_space_02.avif",
      "property/showcase_bb/avif/shared_space_03.avif",
      "property/showcase_bb/avif/shared_space_04.avif",

    ],
    "room 1": [
      "property/showcase_bb/avif/room1_0.avif",
      "property/showcase_bb/avif/room1_1.avif",
      "property/showcase_bb/avif/room1_2.avif"
    ],
    "room 2": [
      "property/showcase_bb/avif/room2_0.avif",
      "property/showcase_bb/avif/room2_1.avif",
    ],
    "additional": [
      "property/showcase_bb/avif/other_0.avif"
    ],
  },
  description: `Located right in the city center, this elegant B&B offers a prime location just steps from John Ball Zoo. You'll be surrounded by all essential amenities.

The space features a shared open space, two bedrooms with private bathroom, a fully equipped kitchen, and a special outdoor area.

This exceptional setting perfectly combines vibrant urban energy with the tranquility of a comfortable home.`,
  houseRules: [
    "No smoking inside the apartment.",
    "No pets allowed.",
    "Check-in after 2 PM, check-out before 11 AM.",
    "Parties and events are not allowed.",
    "Please respect the neighbors and keep noise to a minimum.",
  ],
  roomPricing: {
    "Room1": {
      price: 120,
      pricePeriods: [
        { from: "2025-10-25", to: "2025-10-25", price: 100 },
        { from: "2025-10-26", to: "2025-10-31", price: 120 },
      ],
      extraPerGuest: 20,
      guestCostBasis: 'perStay',
    },
    "Room2": {
      price: 50,
      pricePeriods: [
        { from: "2025-10-25", to: "2025-10-25", price: 100 },
        { from: "2025-10-26", to: "2025-10-31", price: 120 },
      ],
      extraPerGuest: 20,
      guestCostBasis: 'perStay',
    },
  },
  currency: "€",
  checkIn: "After 2PM",
  checkOut: "Before 11AM",
  email: "test@gmail.com",
  phoneNumber: "+39 000 000 0000",
  whatsAppNumber: "0390000000000",
  apartmentServices: {
    wifi: true,
    ac: true,
    kitchen: true,
    balcony: true,
    swimming_pool: false,
    free_parking: false,
    payment_parking: true,
    wash_machine: true,
    smoke_alarm: true,
    heating: true,
    essentials: true,
    iron: true,
    hair_dryer: true,
    kitchen_kit: true,
    bed_sheets: true,
    towels: true
  },
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2918.526475304864!2d-85.69247790984936!3d42.96685282215508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDLCsDU4JzAwLjciTiA4NcKwNDEnMTUuNCJX!5e0!3m2!1sit!2sit!4v1761232708871!5m2!1sit!2sit",
  showDirections: true,
  carDirectionsDescription: `Take I-96 West from the airport area. Keep left to continue onto I-196 West, following signs for Downtown Grand Rapids/Holland. Take Exit 76 toward Lane Ave. Merge onto Second St NW, then turn left onto Lane Ave NW, left onto Bridge St NW, and finally turn right onto Straight Ave NW. The drive is approximately 20-25 minutes (about 15 miles), depending on traffic.`,
  publicTransportDirectionsDescription: `A taxi or ride-share service will take about 20 minutes (approx. $25-$35). Public bus service is available via The Rapid's Route 27 from the airport (located across from door #4). The bus journey with transfers will take approximately 1 hour 5 minutes to 1 hour 25 minutes.`,
  hostImage: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcScK-0ZMyFB-zb5h3d5QfXsujKK4x8o8uUdZftI22_GWj5YNoUuG3W-IvDUI_dG",
  hostName: "Daniela",
  hostBio: "Managed by Daniela, this property is part of a portfolio dedicated to high-standard accommodations and professional service. We prioritize seamless check-in/out and exceptional cleanliness. Rest easy knowing that all utilities, detailed local guides, and 24/7 guest support are handled by an experienced team. We're here to ensure your focus stays purely on your vacation.",
  hostLanguages: ["English", "French"]
};