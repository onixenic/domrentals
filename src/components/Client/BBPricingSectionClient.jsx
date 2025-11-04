import { useState } from 'react';

export default function BBPricingSectionClient({
                                                 propertyType,
                                                 pricingType,
                                                 bbRooms,
                                                 currentRoomIndex,
                                                 setCurrentRoomIndex,
                                                 pricing,
                                                 setPricing,
                                                 sortedCurrencies
                                               }) {

  const updatePricing = (roomIndex, field, value) => {
    // For B&B, use room name as key; for apartment, use index 0
    const key = propertyType === 'bb' ? bbRooms[roomIndex]?.name : 0;

    setPricing(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  return (
      <>
        {/* B&B Room Tabs */}
        {propertyType === 'bb' && bbRooms.length > 0 && pricingType !== 'contactHost' && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Set Pricing Per Room</h3>
              <div className="flex gap-2 border-b border-gray-300 mb-4 flex-wrap">
                {bbRooms.map((room, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentRoomIndex(index)}
                        className={`px-4 py-2 font-medium rounded-t-lg transition ${
                            index === currentRoomIndex
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {room.name || `Room ${index + 1}`}
                    </button>
                ))}
              </div>
            </div>
        )}

        {/* Pricing Content for Active Room */}
        {(pricingType === 'fixedAllYear' ||
            pricingType === 'fixedExtraGuests' ||
            pricingType === 'dynamicDates' ||
            pricingType === 'dynamicDatesExtraGuests') && (
            <div className="mt-6 space-y-4">
              {/* Fixed Price */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2">Fixed Price</h4>
                <div className="flex gap-4 items-center">
                  <input
                      type="number"
                      value={pricing[propertyType === 'bb' ? bbRooms[currentRoomIndex]?.name : 0]?.fixedPrice || 0}
                      onChange={(e) => updatePricing(currentRoomIndex, 'fixedPrice', parseFloat(e.target.value))}
                      className="input flex-1"
                      placeholder="e.g., 120"
                  />
                  <select
                      value={pricing[propertyType === 'bb' ? bbRooms[currentRoomIndex]?.name : 0]?.currency || '€'}
                      onChange={(e) => updatePricing(currentRoomIndex, 'currency', e.target.value)}
                      className="input w-32"
                  >
                    {sortedCurrencies.map(curr => (
                        <option key={curr.code} value={curr.symbol}>
                          {curr.code} – {curr.symbol}
                        </option>
                    ))}
                  </select>
                </div>
                <p className="text-gray-600 text-sm mt-2">Price per night by default.</p>
              </div>
            </div>
        )}

        {/* Extra Fee per Guest */}
        {(pricingType === 'fixedExtraGuests' || pricingType === 'dynamicDatesExtraGuests') && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Extra Fee per Guest</h4>
              <p className="text-gray-600 text-sm mb-2">
                Charge extra guests <strong>per night</strong> or <strong>per stay</strong>.
              </p>
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Extra per guest (€)</span>
                  <input
                      type="number"
                      value={pricing[propertyType === 'bb' ? bbRooms[currentRoomIndex]?.name : 0]?.extraPerGuest || 0}
                      onChange={(e) => updatePricing(currentRoomIndex, 'extraPerGuest', parseFloat(e.target.value))}
                      className="input mt-1"
                      placeholder="e.g., 20"
                      min="0"
                      step="0.5"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Charge Type</span>
                  <select
                      value={pricing[propertyType === 'bb' ? bbRooms[currentRoomIndex]?.name : 0]?.extraPerGuestType || 'perNight'}
                      onChange={(e) => updatePricing(currentRoomIndex, 'extraPerGuestType', e.target.value)}
                      className="input mt-1"
                  >
                    <option value="perNight">Per night</option>
                    <option value="perStay">Per stay</option>
                  </select>
                </label>
              </div>
            </div>
        )}
      </>
  );
}