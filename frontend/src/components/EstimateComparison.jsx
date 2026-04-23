import EstimateResult from './EstimateResult';

export default function EstimateComparison({ estimates, onClear, onRemove }) {
  if (estimates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Generate estimates to compare plans</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 sm:p-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Estimate Comparison
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {estimates.length} plan{estimates.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        {estimates.length > 0 && (
          <button
            onClick={onClear}
            className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded font-medium hover:bg-red-600 transition text-sm sm:text-base"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 对比表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">
                  Plan
                </th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">
                  Customer
                </th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">
                  Job Type
                </th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-gray-700">
                  Equipment Cost
                </th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-gray-700">
                  Labor Cost
                </th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold text-gray-700 text-green-600">
                  Total
                </th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {estimates.map((est, idx) => (
                <tr key={est.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-gray-700 font-medium">
                    Plan {idx + 1}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs sm:text-sm">
                    {est.customer.name}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs sm:text-sm">
                    {est.jobDetails.type}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-gray-600">
                    ${est.equipmentCost.toFixed(2)}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right text-gray-600">
                    ${est.laborCost.toFixed(2)}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-bold text-green-600 text-base sm:text-lg">
                    ${est.total.toFixed(2)}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <button
                      onClick={() => onRemove(est.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Plans */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Detailed Plans</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {estimates.map((est, idx) => (
            <div key={est.id} className="relative">
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm" title={`Plan ${idx + 1}`}>
                {idx + 1}
              </div>
              <EstimateResult estimate={est} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
