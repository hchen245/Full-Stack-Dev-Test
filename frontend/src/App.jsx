import { useState, useEffect } from 'react';
import axios from 'axios';
import EstimateForm from './components/EstimateForm';
import EstimateComparison from './components/EstimateComparison';

// Set API base URL - works for both local development and Vercel
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

export default function App() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [error, setError] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('📱 Install prompt ready');
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      console.log('✅ App installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running as installed app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      console.log('✅ Running as installed app');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setInstallPrompt(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        console.log('Fetching from:', API_BASE);
        const [customersRes, equipmentRes, ratesRes] = await Promise.all([
          axios.get(`${API_BASE}/customers`),
          axios.get(`${API_BASE}/equipment`),
          axios.get(`${API_BASE}/labor-rates`),
        ]);
        console.log('Data loaded successfully');
        setCustomers(customersRes.data);
        setEquipment(equipmentRes.data);
        setLaborRates(ratesRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data. Make sure backend is running on http://localhost:5000');
      }
    };
    fetchData();
  }, []);

  const handleGenerateEstimate = async (formData) => {
    setLoading(true);
    try {
      console.log('Sending estimate request:', formData);
      const response = await axios.post(`${API_BASE}/estimate`, formData);
      console.log('Estimate response:', response.data);
      // Add new estimate to the list instead of replacing
      setEstimates(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown error';
      alert('Failed to generate estimate: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEstimates = () => {
    if (estimates.length > 0 && window.confirm('confirm clear all estimates?')) {
      setEstimates([]);
    }
  };

  const handleRemoveEstimate = (estimateId) => {
    setEstimates(prev => prev.filter(est => est.id !== estimateId));
  };

  return (
    <div className="min-h-screen bg-gray-50 md:bg-gray-100">
      <header className="bg-blue-600 text-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">HVAC Estimate Tool</h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1 sm:mt-2">Quick On-Site Quoting System</p>
          </div>
          <div className="flex items-center gap-2">
            {!installed && (
              <div className="flex items-center gap-2">
                {installPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-50 transition text-sm sm:text-base"
                  >
                    ⬇️ Install App
                  </button>
                )}
                {!installPrompt && (
                  <div className="text-blue-100 text-xs sm:text-sm px-3 py-2 bg-blue-700 rounded animate-pulse">
                    💻 Web App - Works Offline
                  </div>
                )}
              </div>
            )}
            {installed && (
              <span className="text-blue-100 text-sm">✅ App Installed</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {/* 单列布局用于对比视图 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* 左侧表单 - 1/3 */}
          <div>
            <EstimateForm
              customers={customers}
              equipment={equipment}
              laborRates={laborRates}
              onSubmit={handleGenerateEstimate}
              loading={loading}
            />
          </div>
          
          {/* 右侧对比面板 - 2/3 */}
          <div className="xl:col-span-2">
            <EstimateComparison
              estimates={estimates}
              onClear={handleClearEstimates}
              onRemove={handleRemoveEstimate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
