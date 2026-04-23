import { useState, useMemo } from 'react';

export default function EstimateForm({
  customers,
  equipment,
  laborRates,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    customerId: '',
    jobType: '',
    complexity: '',
    equipmentIds: [],
    estimatedHours: '',
    notes: '',
  });

  const [customerSearch, setCustomerSearch] = useState('');

  // Fuzzy search for customers (name, address, phone)
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const query = customerSearch.toLowerCase();
    return customers.filter(c => {
      const name = (c.name || '').toLowerCase();
      const address = (c.address || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(query) || address.includes(query) || phone.includes(query);
    });
  }, [customerSearch, customers]);

  const jobTypes = [...new Set(laborRates.map(lr => lr.jobType))];
  const complexities = (formData.jobType
    ? laborRates
        .filter(lr => lr.jobType === formData.jobType)
        .map(lr => lr.level)
    : []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (eqId) => {
    setFormData(prev => ({
      ...prev,
      equipmentIds: prev.equipmentIds.includes(eqId)
        ? prev.equipmentIds.filter(id => id !== eqId)
        : [...prev.equipmentIds, eqId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.jobType || !formData.complexity) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Convert estimatedHours to number if provided
    const submitData = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
    };
    
    // Remove null estimatedHours
    if (submitData.estimatedHours === null) {
      delete submitData.estimatedHours;
    }
    
    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 sm:space-y-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Generate Estimate</h2>

      {/* Customer Selection with Fuzzy Search */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Select Customer * (Type to search)
        </label>
        <input
          type="text"
          placeholder="Search by name, address, or phone..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <select
          name="customerId"
          value={formData.customerId}
          onChange={handleChange}
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a customer --</option>
          {filteredCustomers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.address} {c.phone ? `(${c.phone})` : ''}
            </option>
          ))}
        </select>
        {customers.length === 0 && (
          <p className="text-xs sm:text-sm text-red-500 mt-1">No customers found. Check if backend is running.</p>
        )}
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Job Type *
        </label>
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select job type --</option>
          {jobTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        {jobTypes.length === 0 && (
          <p className="text-xs sm:text-sm text-red-500 mt-1">No job types found. Check if backend is running.</p>
        )}
      </div>

      {/* Complexity Level */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Complexity Level *
        </label>
        <select
          name="complexity"
          value={formData.complexity}
          onChange={handleChange}
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          disabled={!formData.jobType}
        >
          <option value="">-- Select complexity --</option>
          {complexities.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Estimated Hours */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Estimated Hours (optional)
        </label>
        <input
          type="number"
          name="estimatedHours"
          value={formData.estimatedHours}
          onChange={handleChange}
          placeholder="Leave blank for default"
          step="0.5"
          min="0"
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Equipment Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Select Equipment (Check all needed items)
        </label>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-300 rounded p-3 bg-gray-50">
          {equipment.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">Loading equipment...</p>
          ) : (
            equipment.map(eq => (
              <div key={eq.id} className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded">
                <input
                  type="checkbox"
                  id={`eq-${eq.id}`}
                  checked={formData.equipmentIds.includes(eq.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        equipmentIds: [...prev.equipmentIds, eq.id]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        equipmentIds: prev.equipmentIds.filter(id => id !== eq.id)
                      }));
                    }
                  }}
                  className="w-4 h-4 cursor-pointer accent-green-500"
                />
                <label htmlFor={`eq-${eq.id}`} className="flex-1 cursor-pointer">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    {formData.equipmentIds.includes(eq.id) ? '✓ ' : ''}{eq.name}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">${eq.baseCost}</span>
                </label>
              </div>
            ))
          )}
        </div>
        {equipment.length > 0 && formData.equipmentIds.length > 0 && (
          <p className="text-xs sm:text-sm text-green-600 mt-2">
            ✓ {formData.equipmentIds.length} item{formData.equipmentIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Notes <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional notes or special instructions"
          rows="3"
          className="w-full text-base sm:text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white text-base sm:text-base py-3 sm:py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition active:scale-95"
      >
        {loading ? 'Generating...' : '+ Generate Plan'}
      </button>
    </form>
  );
}
