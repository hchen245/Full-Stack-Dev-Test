import { useRef } from 'react';

export default function EstimateResult({ estimate }) {
  const estimateRef = useRef();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = estimateRef.current;
      const opt = {
        margin: 10,
        filename: `estimate-${estimate.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div ref={estimateRef} className="bg-white rounded-lg shadow p-4 sm:p-6 print:shadow-none">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 print:mb-4 gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Estimate</h2>
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base transition"
            title="Download as PDF"
          >
            📥 PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base transition"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Estimate ID and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Estimate Number</p>
          <p className="font-mono text-base sm:text-lg font-bold">{estimate.id}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">Date</p>
          <p className="font-mono text-base sm:text-lg">
            {new Date(estimate.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Customer Information</h3>
        <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
          <p>
            <span className="font-medium">Name: </span>
            {estimate.customer.name}
          </p>
          <p>
            <span className="font-medium">Address: </span>
            <span className="break-words">{estimate.customer.address}</span>
          </p>
          <p>
            <span className="font-medium">Phone: </span>
            <span>{estimate.customer.phone || 'Not provided'}</span>
          </p>
        </div>
      </div>

      {/* Job Details */}
      <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Job Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-600">Job Type</p>
            <p className="font-medium capitalize">{estimate.jobDetails.type}</p>
          </div>
          <div>
            <p className="text-gray-600">Complexity</p>
            <p className="font-medium capitalize">{estimate.jobDetails.complexity}</p>
          </div>
          <div>
            <p className="text-gray-600">Estimated Hours</p>
            <p className="font-medium">{estimate.jobDetails.hours} hours</p>
          </div>
        </div>
        {estimate.jobDetails.notes && (
          <div className="mt-3">
            <p className="text-gray-600 text-xs sm:text-sm">Notes</p>
            <p className="text-xs sm:text-sm">{estimate.jobDetails.notes}</p>
          </div>
        )}
      </div>

      {/* Equipment */}
      {estimate.equipment.length > 0 && (
        <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Equipment</h3>
          <div className="space-y-2">
            {estimate.equipment.map((eq, idx) => (
              <div key={idx} className="flex justify-between text-xs sm:text-sm">
                <span className="break-words pr-2">{eq.name}</span>
                <span className="font-mono font-medium whitespace-nowrap">{formatCurrency(eq.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-gray-50 rounded p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-700">Labor Cost</span>
          <span className="font-mono font-medium">
            {formatCurrency(estimate.laborCost)}
          </span>
        </div>
        {estimate.equipmentCost > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-700">Equipment Cost</span>
            <span className="font-mono font-medium">
              {formatCurrency(estimate.equipmentCost)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs sm:text-sm border-t pt-2">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-mono font-medium">
            {formatCurrency(estimate.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-700">Tax (8%)</span>
          <span className="font-mono font-medium">
            {formatCurrency(estimate.tax)}
          </span>
        </div>
        <div className="flex justify-between text-base sm:text-lg border-t pt-3">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-mono font-bold text-blue-600 text-lg sm:text-xl">
            {formatCurrency(estimate.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
