import React, { useState, useMemo } from 'react';

export default function PricePeriodsManager({
                                              pricePeriods,
                                              setPricePeriods,
                                              currency = '€',
                                              bbRooms = [],
                                              currentRoomIndex = null
                                            }) {
  const [errors, setErrors] = useState({});
  const [expandedPeriods, setExpandedPeriods] = useState({});

  // Determine if this is B&B or Apartment
  const isBB = bbRooms && bbRooms.length > 0;

  // Get active room name for B&B
  const activeRoom = useMemo(() => {
    if (!isBB || currentRoomIndex === null) return null;
    return bbRooms[currentRoomIndex]?.name || null;
  }, [isBB, currentRoomIndex, bbRooms]);

  // Validate a single period
  const validatePeriod = (period) => {
    const periodErrors = {};

    if (!period.from) {
      periodErrors.from = 'Start date is required';
    }
    if (!period.to) {
      periodErrors.to = 'End date is required';
    }
    if (period.from && period.to && period.from >= period.to) {
      periodErrors.to = 'End date must be after start date';
    }
    if (period.price === null || period.price === undefined || period.price < 0) {
      periodErrors.price = 'Price must be 0 or greater';
    }

    return periodErrors;
  };

  // Filter periods based on property type
  const filteredPeriods = useMemo(() => {
    if (!isBB) {
      return pricePeriods;
    }
    // For B&B, filter by room
    return pricePeriods.filter(p => p.room === activeRoom);
  }, [pricePeriods, isBB, activeRoom]);

  // Get the original index in the full array from the filtered display index
  const getOriginalIndex = (displayIndex) => {
    if (!isBB) {
      return displayIndex;
    }

    let count = 0;
    for (let i = 0; i < pricePeriods.length; i++) {
      if (pricePeriods[i].room === activeRoom) {
        if (count === displayIndex) {
          return i;
        }
        count++;
      }
    }
    return -1;
  };

  const addPeriod = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const newPeriod = {
      from: today,
      to: tomorrow,
      price: 0,
      ...(isBB && { room: activeRoom })
    };

    console.log(pricePeriods)
    setPricePeriods([...pricePeriods, newPeriod]);
    setErrors({});
  };

  const updatePeriod = (originalIndex, field, value) => {
    const updated = [...pricePeriods];

    if (field === 'price') {
      updated[originalIndex] = { ...updated[originalIndex], [field]: parseFloat(value) || 0 };
    } else {
      updated[originalIndex] = { ...updated[originalIndex], [field]: value };
    }

    setPricePeriods(updated);

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${originalIndex}-${field}`];
      return newErrors;
    });
  };

  const deletePeriod = (originalIndex) => {
    setPricePeriods(pricePeriods.filter((_, i) => i !== originalIndex));

    // Clear errors for deleted period
    setErrors(prev => {
      const newErrors = { ...prev };
      ['from', 'to', 'price'].forEach(field => {
        delete newErrors[`${originalIndex}-${field}`];
      });
      return newErrors;
    });
  };

  const validateAllPeriods = () => {
    const newErrors = {};
    filteredPeriods.forEach((period, displayIndex) => {
      const originalIndex = getOriginalIndex(displayIndex);
      const periodErrors = validatePeriod(period);

      Object.keys(periodErrors).forEach(field => {
        newErrors[`${originalIndex}-${field}`] = periodErrors[field];
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExpandToggle = (originalIndex) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [originalIndex]: !prev[originalIndex]
    }));
  };

  return (
      <div className="mt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-800">
            {isBB && activeRoom ? `Price Periods - ${activeRoom}` : 'Price Periods'}
          </h4>
          <button
              type="button"
              onClick={addPeriod}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
          >
            + Add Period
          </button>
        </div>

        {/* Empty State */}
        {filteredPeriods.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              {isBB && activeRoom
                  ? `No price periods added for ${activeRoom}. Click "Add Period" to create one.`
                  : 'No price periods added yet. Click "Add Period" to create one.'}
            </p>
        ) : (
            <div className="space-y-3">
              {filteredPeriods.map((period, displayIndex) => {
                const originalIndex = getOriginalIndex(displayIndex);
                const isExpanded = expandedPeriods[originalIndex] || false;

                return (
                    <div key={originalIndex} className="border border-gray-200 rounded-lg bg-gray-50">
                      {/* Collapsed Header */}
                      <button
                          type="button"
                          onClick={() => handleExpandToggle(originalIndex)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                    <span className="font-semibold text-gray-800 whitespace-nowrap">
                      Period {displayIndex + 1}
                    </span>
                          <span className="text-gray-600 text-sm">
                      {period.from && period.to ? `${period.from} → ${period.to}` : 'Dates not set'}
                    </span>
                          <span className="text-gray-600 text-sm font-medium">
                      {period.price ? `${period.price}${currency}` : 'Price not set'}
                    </span>
                        </div>
                        <span className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                          <div className="px-4 pb-4 pt-0 flex flex-col gap-4 border-t border-gray-200">
                            {/* Start Date */}
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                  type="date"
                                  value={period.from || ''}
                                  onChange={(e) => updatePeriod(originalIndex, 'from', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                                      errors[`${originalIndex}-from`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                              />
                              {errors[`${originalIndex}-from`] && (
                                  <span className="text-red-500 text-xs mt-1">{errors[`${originalIndex}-from`]}</span>
                              )}
                            </div>

                            {/* End Date */}
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                  type="date"
                                  value={period.to || ''}
                                  onChange={(e) => updatePeriod(originalIndex, 'to', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                                      errors[`${originalIndex}-to`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                              />
                              {errors[`${originalIndex}-to`] && (
                                  <span className="text-red-500 text-xs mt-1">{errors[`${originalIndex}-to`]}</span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-700 mb-1">
                                Price ({currency})
                              </label>
                              <input
                                  type="number"
                                  value={period.price || 0}
                                  onChange={(e) => updatePeriod(originalIndex, 'price', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                                      errors[`${originalIndex}-price`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                              />
                              {errors[`${originalIndex}-price`] && (
                                  <span className="text-red-500 text-xs mt-1">{errors[`${originalIndex}-price`]}</span>
                              )}
                            </div>

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() => deletePeriod(originalIndex)}
                                className="bg-red-500 text-white font-bold rounded h-10 hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}

        {/* Help Text */}
        <p className="text-gray-600 text-sm mt-3">
          {isBB
              ? 'Set different prices for each room across different time periods.'
              : 'Set different prices for different time periods throughout the year.'}
        </p>
      </div>
  );
}