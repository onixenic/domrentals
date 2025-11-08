import React, {useState, useEffect, useCallback} from 'react';
import { currencies } from '../../config/currencies.js';
import { services } from "../../config/servicesConfig.js";
import { downloadConfig, uploadConfigToFirebase } from '../../scripts/downloadUploadScripts.js';
import { uploadFilesToPropertyBucket } from "../../scripts/firebaseUtils";

import Privacy from "../Footer/Privacy.astro";
import PricingSectionClient from "./BBPricingSectionClient";
import PriceComponentToQuoteClient from "./PriceComponentToQuoteClient";
import PriceComponentFixedPlainClient from "./PriceComponentFixedPlainClient";
import PriceComponentFixedPlainPlusGuestClient from "./PriceComponentFixedPlainPlusGuestClient";
import PriceComponentDynamicClient from "./PriceComponentDynamicClient";
import PriceComponentDynamicPlusGuestClient from "./PriceComponentDynamicPlusGuestClient";
import PricePeriodsManager from "./PricePeriodsManager";
import BBPriceComponentFixedPlainClient from "./BBPriceComponentFixedPlainClient";
import BBPriceComponentFixedPlainPlusGuestClient from "./BBPriceComponentFixedPlainPlusGuestClient";
import BBPriceComponentDynamicClient from "./BBPriceComponentDynamicClient";
import BBPriceComponentDynamicPlusGuestClient from "./BBPriceComponentDynamicPlusGuestClient";
import PhotoUploadClient from "./PhotoUploadClients.jsx";

const mostUsed = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];
const sortedCurrencies = [
  ...currencies.filter(c => mostUsed.includes(c.code)),
  ...currencies
      .filter(c => !mostUsed.includes(c.code))
      .sort((a, b) => a.code.localeCompare(b.code))
];

export default function PropertyConfigLayout() {
  const [propertyId, setPropertyId] = useState('test');
  const [propertyPsw, setPropertyPsw] = useState('test');
  const [hostType, setHostType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyVat, setCompanyVat] = useState('');
  const [companyRep, setCompanyRep] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [individualName, setIndividualName] = useState('');
  const [individualAddress, setIndividualAddress] = useState('');
  const [individualTaxId, setIndividualTaxId] = useState('');
  const [individualEmail, setIndividualEmail] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languagesOther, setLanguagesOther] = useState('');
  const [guests, setGuests] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [checkin, setCheckin] = useState('14:00');
  const [checkout, setCheckout] = useState('11:00');
  const [bbRooms, setBbRooms] = useState([]);
  const [breakfastIncluded, setBreakfastIncluded] = useState(true);
  const [breakfastAvailable, setBreakfastAvailable] = useState(false);
  const [breakfastCost, setBreakfastCost] = useState('');
  const [apartmentPricing, setApartmentPricing] = useState({0: {fixedPrice: 100, currency: '€', extraPerGuest: 0, extraPerGuestType: 'perNight'}});
  const [pricingType, setPricingType] = useState('contactHost');
  const [pricing, setPricing] = useState({0: {fixedPrice: 100, currency: '€', extraPerGuest: 0, extraPerGuestType: 'perNight'}});
  const [pricePeriods, setPricePeriods] = useState({ apartment: [] });
  const [houseRules, setHouseRules] = useState(
      `No smoking inside the apartment.
No pets allowed.
Check-in after 2 PM, check-out before 11 AM.
Parties and events are not allowed.
Please respect the neighbors and keep noise to a minimum.`
  );
  const [selectedServices, setSelectedServices] = useState({});
  const [additionalServices, setAdditionalServices] = useState('');
  const [hostDescription, setHostDescription] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showDirectionsTooltip, setShowDirectionsTooltip] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [uploadingConfig, setUploadingConfig] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [imagesStatus, setImagesStatus] = useState({ hasPendingFiles: false, isUploading: false });
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    const initializeCredentials = async () => {
      try {
        const res = await fetch('/api/generateProperty');
        if (!res.ok) throw new Error('Failed to generate credentials');

        const data = await res.json();
        setPropertyId(data.propertyId.toString());
        setPropertyPsw(data.password);
      } catch (err) {
        console.error('Error:', err);
      } finally {
      }
    };

    initializeCredentials();
  }, []);

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  useEffect(() => {
    if (downloadError) {
      const timer = setTimeout(() => setDownloadError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [downloadError]);

  useEffect(() => {
    setPricing(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        let roomKey = key;
        if (propertyType === 'apartment' && key === '0') {
          roomKey = 'apartment';
        }
        updated[key] = {
          ...updated[key],
          pricePeriods: pricePeriods[roomKey] || []
        };
      });
      return updated;
    });
  }, [pricePeriods, propertyType]);

  const getSubmitDisabledReason = () => {
    if (!privacyConsent) {
      return "Please accept the privacy policy";
    }
    if (uploadingConfig) {
      return "Submitting configuration...";
    }
    if (imagesStatus.isUploading) {
      return "Images are uploading...";
    }
    if (imagesStatus.hasPendingFiles) {
      return "Please upload all selected images before submitting";
    }
    return null;
  };

  const formatTimeForDisplay = (time, type) => {
    if (!time) return '';
    if (type === 'checkin') {
      return `After ${time}`;
    } else if (type === 'checkout') {
      return `Before ${time}`;
    }
    return time;
  };

  const toggleLanguage = (lang) => {
    setLanguages(prev =>
        prev.includes(lang)
            ? prev.filter(l => l !== lang)
            : [...prev, lang]
    );
  };

  const toggleService = (serviceKey) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
  };

  const addRoom = () => {
    const newRoomName = `Room${bbRooms.length + 1}`;
    const newRoom = {
      name: newRoomName,
      guests: 1,
      beds: 1,
      bathrooms: 1,
      privateBathroom: false,
    };

    setBbRooms(prev => [...prev, newRoom]);
    setPricePeriods(prev => ({
      ...prev,
      [newRoomName]: []
    }));
    setPricing(prev => ({
      ...prev,
      [newRoomName]: {
        price: 0,
        currency: "€",
        pricePeriods: [],
        extraPerGuest: 0,
        guestCostBasis: 'perStay',
      },
    }));
  };

  const updateRoom = (index, field, value) => {
    setBbRooms(prev => {
      const updated = [...prev];
      const oldName = updated[index].name;
      updated[index] = {...updated[index], [field]: value};

      if (field === 'name' && value !== oldName && oldName) {
        setPricePeriods(prev => {
          const updatedPeriods = {...prev};
          if (updatedPeriods[oldName]) {
            updatedPeriods[value] = updatedPeriods[oldName];
            delete updatedPeriods[oldName];
          } else {
            updatedPeriods[value] = [];
          }
          return updatedPeriods;
        });

        setPricing(prev => {
          const updatedPricing = {...prev};
          if (updatedPricing[oldName]) {
            updatedPricing[value] = updatedPricing[oldName];
            delete updatedPricing[oldName];
          } else {
            updatedPricing[value] = {
              price: 0,
              currency: "€",
              pricePeriods: [],
              extraPerGuest: 0,
              guestCostBasis: 'perStay',
            };
          }
          return updatedPricing;
        });
      }

      return updated;
    });
  };

  const deleteRoom = (index) => {
    setBbRooms(prev => {
      const roomToDelete = prev[index];
      const updatedRooms = prev.filter((_, i) => i !== index);

      setPricePeriods(prev => {
        const updatedPeriods = {...prev};
        if (roomToDelete?.name) {
          delete updatedPeriods[roomToDelete.name];
        }
        return updatedPeriods;
      });

      setPricing(prev => {
        const updatedPricing = {...prev};
        if (roomToDelete?.name) {
          delete updatedPricing[roomToDelete.name];
        }
        return updatedPricing;
      });

      return updatedRooms;
    });
  };

  const handleUploadAndUpdate = async () => {
    try {
      setUploadError('');
      setUploadSuccess('');
      await handleUpload();
      await updateFirestoreDB(true);
    } catch (error) {
      setUploadError(error.message || 'Failed to complete submission');
    }
  };

  const handleSubmit = async () => {
    try {
      await updateFirestoreDB(false);
    } catch (error) {
      console.error('Failed to update Firestore after image upload:', error);
      setUploadError(error.message || 'Failed to update after image upload');
    }
  };

  const handlePropertyTypeChange = (newType) => {
    if (newType === 'bb') {
      setApartmentPricing(pricing);
      setPricing({});
      setBbRooms([]);
      setPropertyType('bb');
    } else if (newType === 'apartment') {
      setPricing(apartmentPricing);
      setPropertyType('apartment');
    }
  };

  const handleBreakfastIncludedChange = (checked) => {
    setBreakfastIncluded(checked);
    if (checked) {
      setBreakfastAvailable(false);
      setBreakfastCost('');
    }
  };

  const handleBreakfastAvailableChange = (checked) => {
    setBreakfastAvailable(checked);
    if (!checked) {
      setBreakfastCost('');
    }
  };

  const getConfigData = useCallback(() => ({
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
  }), [propertyType, pricingType, pricing, propertyId]);

  const handleDownload = useCallback(() => {
    setDownloadError('');

    if (!privacyConsent) {
      setDownloadError('Please accept the privacy policy before downloading');
      return;
    }

    try {
      downloadConfig(getConfigData(), propertyType, propertyId);
      setUploadSuccess('Configuration downloaded successfully');
    } catch (error) {
      setDownloadError(error.message || 'Failed to download config');
    }
  }, [privacyConsent, getConfigData, propertyType, propertyId]);

  const handleUpload = useCallback(async () => {
    setDownloadError('');

    if (!privacyConsent) {
      setUploadError('Please accept the privacy policy before uploading');
      return;
    }

    setUploadingConfig(true);
    setUploadError('');

    try {
      const result = await uploadConfigToFirebase(
          getConfigData(),
          propertyType,
          propertyId,
          uploadFilesToPropertyBucket
      );
      setUploadSuccess(result.message || 'Data uploaded successfully');
      setUploadingConfig(false);
    } catch (error) {
      setUploadError(error.message || 'Failed to upload config');
      setUploadingConfig(false);
    }
  }, [privacyConsent, getConfigData, propertyType, propertyId]);

  const updateFirestoreDB = async (isInitialSubmit = false) => {
    try {
      const response = await fetch('/api/updateFirestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          password: propertyPsw,
          hostType,
          companyRep,
          individualName,
          phone,
          imgUploaded: true,
          jsonUploaded: !isInitialSubmit,
          isUpdate: !isInitialSubmit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  return (
      <div className="min-h-screen flex flex-col font-[Geist] bg-white text-gray-900">
        <main className="flex-1 mx-auto px-6 max-w-6xl w-full">

          <form className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 space-y-10">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">Property Configuration</h1>

            {/* Host Data */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Host Data</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Property ID</label>
                  <input type="text" value={propertyId} className="input w-full mt-1" readOnly/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Property Password</label>
                  <input type="text" value={propertyPsw} className="input w-full mt-1"/>
                </div>
              </div>

              <div className="flex flex-col mb-6">
                <span className="text-sm font-medium text-gray-700 mb-2">Host Type</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="hostType"
                        value="company"
                        checked={hostType === 'company'}
                        onChange={(e) => setHostType(e.target.value)}
                        className="radio"
                        required
                    />
                    Company
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="hostType"
                        value="individual"
                        checked={hostType === 'individual'}
                        onChange={(e) => setHostType(e.target.value)}
                        className="radio"
                        required
                    />
                    Individual
                  </label>
                </div>
              </div>

              {hostType === 'company' && (
                  <div className="grid md:grid-cols-5 gap-6 mb-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. ABC Ltd."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Legal Address</label>
                      <input
                          type="text"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. 123 Main Street, Rome, Italy"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                      <input
                          type="text"
                          value={companyVat}
                          onChange={(e) => setCompanyVat(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. IT1234567890"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Legal Representative</label>
                      <input
                          type="text"
                          value={companyRep}
                          onChange={(e) => setCompanyRep(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. Jane Smith"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Company Email</label>
                      <input
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. info@example.com"
                      />
                    </div>
                  </div>
              )}

              {hostType === 'individual' && (
                  <div className="grid md:grid-cols-5 gap-6 mb-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                          type="text"
                          value={individualName}
                          onChange={(e) => setIndividualName(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. John Doe"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                      <input
                          type="text"
                          value={individualAddress}
                          onChange={(e) => setIndividualAddress(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. 456 Main Street, Rome, Italy"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                      <input
                          type="text"
                          value={individualTaxId}
                          onChange={(e) => setIndividualTaxId(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. 12345678901"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                          type="email"
                          value={individualEmail}
                          onChange={(e) => setIndividualEmail(e.target.value)}
                          className="input w-full mt-1"
                          placeholder="Ex. info@example.com"
                      />
                    </div>
                  </div>
              )}
            </div>

            {/* Property Type */}
            <fieldset className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Property Type</h2>
              <div className="flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2">
                  <input
                      type="radio"
                      name="type"
                      value="apartment"
                      checked={propertyType === 'apartment'}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="radio"
                  />
                  Villa / Apartment
                </label>
                <label className="flex items-center gap-2">
                  <input
                      type="radio"
                      name="type"
                      value="bb"
                      checked={propertyType === 'bb'}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="radio"
                  />
                  B&B
                </label>
              </div>
            </fieldset>

            {/* General Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input w-full mt-1"
                    placeholder="Ex. Cozy Seaside Apartment"
                    required
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input w-full mt-1"
                      placeholder="Ex. Via Antonio Gramsci 1, Bologna, Italy"
                      required
                  />
                </div>

                <div className="relative flex items-center gap-2 mt-6 md:mt-0">
                  <input
                      type="checkbox"
                      id="showDirections"
                      checked={showDirections}
                      onChange={(e) => setShowDirections(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                      htmlFor="showDirections"
                      className="text-sm text-gray-700 cursor-pointer relative group"
                      onMouseEnter={() => window.innerWidth >= 768 && setShowDirectionsTooltip(true)}
                      onMouseLeave={() => window.innerWidth >= 768 && setShowDirectionsTooltip(false)}
                      onClick={() => window.innerWidth < 768 && setShowDirectionsTooltip(!showDirectionsTooltip)}
                  >
                    Show directions
                    {showDirectionsTooltip && (
                        <span className="absolute left-0 -top-14 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg opacity-100 pointer-events-none">
                      We'll create a section for your guests with instructions on how to reach the apartment by car or public transport.
                    </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full mt-1"
                    placeholder="Ex. info@example.com"
                    required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input w-full mt-1"
                    placeholder="Ex. +39 123 456 7890"
                    required
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2">Languages Spoken by Host</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {['English', 'Italian', 'Spanish', 'French', 'German'].map(lang => (
                      <label key={lang} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={languages.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                            className="checkbox"
                        />
                        <span>{lang}</span>
                      </label>
                  ))}
                  <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={languages.includes('other')}
                        onChange={() => toggleLanguage('other')}
                        className="checkbox"
                    />
                    <span>Other</span>
                  </label>
                </div>
                {languages.includes('other') && (
                    <input
                        type="text"
                        value={languagesOther}
                        onChange={(e) => setLanguagesOther(e.target.value)}
                        placeholder="Specify other language"
                        className="input mt-2 w-full"
                    />
                )}
              </div>
            </div>

            {/* B&B Section */}
            {propertyType === 'bb' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">B&B Details</h2>

                  <div className="mt-4 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Rooms:</span>
                      <span className="font-semibold text-gray-800">{bbRooms.length}</span>
                      <button
                          type="button"
                          onClick={addRoom}
                          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                      >
                        Add Room
                      </button>
                    </div>

                    <div className="space-y-4">
                      {bbRooms.map((room, index) => (
                          <div key={index} className="border border-gray-200 rounded p-4">
                            <div className="grid md:grid-cols-5 gap-4 mb-4">
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                                    className="input mt-1"
                                    placeholder="Ex. Sea View Room"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Guests</label>
                                <input
                                    type="number"
                                    value={room.guests}
                                    onChange={(e) => updateRoom(index, 'guests', parseInt(e.target.value))}
                                    className="input mt-1"
                                    min="1"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Beds</label>
                                <input
                                    type="number"
                                    value={room.beds}
                                    onChange={(e) => updateRoom(index, 'beds', parseInt(e.target.value))}
                                    className="input mt-1"
                                    min="1"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                <input
                                    type="number"
                                    value={room.bathrooms}
                                    onChange={(e) => updateRoom(index, 'bathrooms', parseInt(e.target.value))}
                                    className="input mt-1"
                                    min="1"
                                />
                              </div>
                              <label className="flex items-center gap-2 mt-6 md:mt-5">
                                <input
                                    type="checkbox"
                                    checked={room.privateBathroom}
                                    onChange={(e) => updateRoom(index, 'privateBathroom', e.target.checked)}
                                    className="checkbox"
                                />
                                <span>Private Bathroom</span>
                              </label>
                            </div>
                            <div className="flex justify-end">
                              <button
                                  type="button"
                                  onClick={() => deleteRoom(index)}
                                  className="bg-red-500 text-white font-bold rounded w-full h-10 flex items-center justify-center md:w-10 md:h-10">
                                X
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>

                    <fieldset className="block mt-4">
                      <span className="text-sm font-medium text-gray-700">Breakfast</span>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                              type="checkbox"
                              checked={breakfastIncluded}
                              onChange={(e) => handleBreakfastIncludedChange(e.target.checked)}
                          />
                          <span>Included in stay</span>
                        </label>

                        {!breakfastIncluded && (
                            <div className="ml-6 space-y-3">
                              <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={breakfastAvailable}
                                    onChange={(e) => handleBreakfastAvailableChange(e.target.checked)}
                                />
                                <span>Available as add-on</span>
                              </label>

                              {breakfastAvailable && (
                                  <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Breakfast Cost (€)</span>
                                    <input
                                        type="number"
                                        value={breakfastCost}
                                        onChange={(e) => setBreakfastCost(e.target.value)}
                                        className="input mt-1"
                                        min="0"
                                        step="0.5"
                                    />
                                  </label>
                              )}
                            </div>
                        )}
                      </div>
                    </fieldset>
                  </div>
                </div>
            )}

            {/* Apartment Section */}
            {propertyType === 'apartment' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Villa / Apartment Details</h2>
                  <div className="mt-4 grid md:grid-cols-4 gap-6">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Guests</span>
                      <input
                          type="number"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          className="input mt-1"
                          min="1"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Bedrooms</span>
                      <input
                          type="number"
                          value={bedrooms}
                          onChange={(e) => setBedrooms(parseInt(e.target.value))}
                          className="input mt-1"
                          min="1"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Beds</span>
                      <input
                          type="number"
                          value={beds}
                          onChange={(e) => setBeds(parseInt(e.target.value))}
                          className="input mt-1"
                          min="1"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Bathrooms</span>
                      <input
                          type="number"
                          value={bathrooms}
                          onChange={(e) => setBathrooms(parseInt(e.target.value))}
                          className="input mt-1"
                          min="1"
                      />
                    </label>
                  </div>
                </div>
            )}

            {/* Check-in/out Times */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                <input
                    type="time"
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    className="input w-full mt-1"
                    required
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                <input
                    type="time"
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    className="input w-full mt-1"
                    required
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h2>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="space-y-3 flex-1">
                  <p className="text-gray-600 text-sm mb-4">Choose how you want to display pricing to guests.</p>
                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="pricingType"
                        value="contactHost"
                        checked={pricingType === 'contactHost'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="radio"
                    />
                    <span>No price shown, contact host</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="pricingType"
                        value="fixedAllYear"
                        checked={pricingType === 'fixedAllYear'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="radio"
                    />
                    <span>Fixed price all year</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="pricingType"
                        value="fixedExtraGuests"
                        checked={pricingType === 'fixedExtraGuests'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="radio"
                    />
                    <span>Fixed price, plus extra per guest</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="pricingType"
                        value="dynamicDates"
                        checked={pricingType === 'dynamicDates'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="radio"
                    />
                    <span>Price based on dates</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="pricingType"
                        value="dynamicDatesExtraGuests"
                        checked={pricingType === 'dynamicDatesExtraGuests'}
                        onChange={(e) => setPricingType(e.target.value)}
                        className="radio"
                    />
                    <span>Price based on dates, plus extra per guest</span>
                  </label>

                  <PricingSectionClient
                      propertyType={propertyType}
                      pricingType={pricingType}
                      bbRooms={bbRooms}
                      currentRoomIndex={currentRoomIndex}
                      setCurrentRoomIndex={setCurrentRoomIndex}
                      pricing={pricing}
                      setPricing={setPricing}
                      sortedCurrencies={sortedCurrencies}
                  />

                  {(pricingType === 'dynamicDates' || pricingType === 'dynamicDatesExtraGuests') && (
                      <PricePeriodsManager
                          pricePeriods={propertyType === 'bb'
                              ? (pricePeriods[bbRooms[currentRoomIndex]?.name] || [])
                              : (pricePeriods['apartment'] || [])
                          }
                          setPricePeriods={(newPeriods) => {
                            if (propertyType === 'bb') {
                              const roomName = bbRooms[currentRoomIndex]?.name;
                              if (roomName) {
                                setPricePeriods(prev => ({
                                  ...prev,
                                  [roomName]: newPeriods
                                }));
                              }
                            } else {
                              setPricePeriods(prev => ({
                                ...prev,
                                apartment: newPeriods
                              }));
                            }
                          }}
                          currency={propertyType === 'bb'
                              ? (pricing[Object.keys(pricing)[0]]?.currency || '€')
                              : (pricing['0']?.currency || '€')
                          }
                          bbRooms={propertyType === 'bb' ? bbRooms : []}
                          currentRoomIndex={propertyType === 'bb' ? currentRoomIndex : null}
                      />
                  )}
                </div>

                {pricingType === 'contactHost' && (
                    <div className="flex-1">
                      <PriceComponentToQuoteClient
                          propertyId={propertyId}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}

                {(propertyType === 'apartment' && pricingType === 'fixedAllYear') && (
                    <div className="flex-1">
                      <PriceComponentFixedPlainClient
                          propertyId={propertyId}
                          price={pricing["0"].fixedPrice}
                          currency={pricing["0"].currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}

                {(propertyType === 'apartment' && pricingType === 'fixedExtraGuests') && (
                    <div className="flex-1">
                      <PriceComponentFixedPlainPlusGuestClient
                          propertyId={propertyId}
                          price={pricing["0"].fixedPrice}
                          currency={pricing["0"].currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber=""
                          guests={guests}
                          extraPerGuest={pricing["0"].extraPerGuest}
                          guestCostBasis={pricing["0"].extraPerGuestType}
                      />
                    </div>
                )}

                {(propertyType === 'apartment' && pricingType === 'dynamicDates') && (
                    <div className="flex-1">
                      <PriceComponentDynamicClient
                          propertyId={propertyId}
                          price={pricing["0"].fixedPrice}
                          pricePeriods={pricePeriods['apartment'] || []}
                          currency={pricing["0"].currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber=""
                      />
                    </div>
                )}

                {(propertyType === 'apartment' && pricingType === 'dynamicDatesExtraGuests') && (
                    <div className="flex-1">
                      <PriceComponentDynamicPlusGuestClient
                          propertyId={propertyId}
                          price={pricing["0"].fixedPrice}
                          pricePeriods={pricePeriods['apartment'] || []}
                          currency={pricing["0"].currency}
                          checkIn={formatTimeForDisplay(checkin, "checkin")}
                          checkOut={formatTimeForDisplay(checkout, "checkout")}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber=""
                          guests={guests}
                          extraPerGuest={pricing["0"].extraPerGuest}
                          guestCostBasis={pricing["0"].extraPerGuestType}
                      />
                    </div>
                )}

                {(propertyType === 'bb' && pricingType === 'fixedAllYear' && bbRooms.length > 0) && (
                    <div className="flex-1">
                      <BBPriceComponentFixedPlainClient
                          propertyId={propertyId}
                          roomPricing={pricing}
                          currency={pricing[Object.keys(pricing)[0]]?.currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}

                {(propertyType === 'bb' && pricingType === 'fixedExtraGuests' && bbRooms.length > 0) && (
                    <div className="flex-1">
                      <BBPriceComponentFixedPlainPlusGuestClient
                          propertyId={propertyId}
                          roomPricing={pricing}
                          roomDetails={bbRooms}
                          currency={pricing[Object.keys(pricing)[0]]?.currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}

                {(propertyType === 'bb' && pricingType === 'dynamicDates' && bbRooms.length > 0) && (
                    <div className="flex-1">
                      <BBPriceComponentDynamicClient
                          propertyId={propertyId}
                          roomPricing={pricing}
                          currency={pricing[Object.keys(pricing)[0]]?.currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}

                {(propertyType === 'bb' && pricingType === 'dynamicDatesExtraGuests' && bbRooms.length > 0) && (
                    <div className="flex-1">
                      <BBPriceComponentDynamicPlusGuestClient
                          propertyId={propertyId}
                          roomPricing={pricing}
                          roomDetails={bbRooms}
                          currency={pricing[Object.keys(pricing)[0]]?.currency}
                          checkIn={formatTimeForDisplay(checkin, 'checkin')}
                          checkOut={formatTimeForDisplay(checkout, 'checkout')}
                          email={email}
                          phoneNumber={phone}
                          whatsAppNumber={""}
                      />
                    </div>
                )}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">House Rules</h2>
              <textarea
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  className="input h-32 mt-1 w-full"
                  required
              />
            </div>

            {/* Services */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Services (guests can use on their own)</h2>
              <p className="text-gray-600 mb-4">Facilities and services accessible to guests for <strong>self-use</strong> during their stay.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map(service => (
                    <label key={service.key} className="flex items-center gap-2">
                      <input
                          type="checkbox"
                          checked={selectedServices[service.key] || false}
                          onChange={() => toggleService(service.key)}
                          className="checkbox"
                      />
                      <span>{service.name}</span>
                    </label>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Additional Services</h2>
              <p className="text-gray-600 mb-2">Specify any extra facilities or services that guests can use on their own which are not included in the list above.</p>
              <textarea
                  value={additionalServices}
                  onChange={(e) => setAdditionalServices(e.target.value)}
                  className="input h-24 mt-1 w-full"
                  placeholder="Ex. Hot tub, private gym, barbecue area..."
              />
            </div>

            {/* Host Description */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Host Description</h2>
              <p className="text-gray-600 mb-2">Please provide a short description about yourself:</p>
              <textarea
                  value={hostDescription}
                  onChange={(e) => setHostDescription(e.target.value)}
                  className="input w-full h-32 mt-1"
                  placeholder="Ex. Managed by Daniela, this property is part of a portfolio dedicated to high-standard accommodations..."
              />
            </div>

            {/* Upload photos */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload Photos</h2>
              <p className="text-gray-600 mb-2">Kindly provide photos in the highest quality possible and include as many as relevant.</p>
              <div className="relative group inline-block w-full">
                <PhotoUploadClient
                    propertyId={propertyId}
                    privacyConsent={privacyConsent}
                    onUploadStart={() => {}}
                    onUploadComplete={() => handleUploadAndUpdate()}
                    onUploadError={() => {}}
                    onUploadStatusChange={(status) => setImagesStatus(status)}
                />
                {!privacyConsent && (
                    <div className="absolute bottom-full left-0 mb-3 w-56 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-normal text-center">
                      Please accept the privacy policy before uploading
                      <div className="absolute top-full left-0 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                )}
              </div>
            </div>

            {/* Privacy Consent */}
            <div className="flex items-start gap-2 border-t pt-6">
              <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  required
                  className="checkbox mt-1"
              />
              <label htmlFor="privacy-consent" className="text-sm text-gray-700">
                I have read and accept the
                <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const modal = document.getElementById("privacy_modal");
                      if (modal) modal.showModal();
                    }}
                    className="text-blue-600 underline ml-1"
                >
                  Privacy Policy
                </a>
                and consent to the processing of my personal data for the purposes of creating and managing my property configuration.
                <span className="text-red-500"> *</span>
              </label>
            </div>
          </form>

          <div className="flex justify-end gap-4 mt-6 flex-wrap">
            {/* Status Messages on Left */}
            <div className="flex items-center gap-2">
              {uploadSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2 animate-in fade-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{uploadSuccess}</span>
                  </div>
              )}

              {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2 animate-in fade-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{uploadError}</span>
                  </div>
              )}
            </div>

            {/* Submit Button with Tooltip on Hover */}
            <div className="relative group">
              <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!privacyConsent || uploadingConfig || imagesStatus.isUploading || imagesStatus.hasPendingFiles}
                  className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              >
                {uploadingConfig ? '...' : 'Submit'}
              </button>

              {/* Tooltip - Shows on hover when disabled */}
              {(!privacyConsent || uploadingConfig || imagesStatus.isUploading || imagesStatus.hasPendingFiles) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-normal text-center">
                    {getSubmitDisabledReason()}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}