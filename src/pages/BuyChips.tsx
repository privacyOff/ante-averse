
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ChipCounter from '@/components/ChipCounter';

interface ChipPackage {
  chips: number;
  price: number;
  colorClass: string;
}

const BuyChips = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<ChipPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  useEffect(() => {
    // Check if we have a preselected package from navigation state
    if (location.state && location.state.selectedPackage) {
      setSelectedPackage(location.state.selectedPackage);
      setIsModalOpen(true);
    }
  }, [location.state]);

  const chipPackages: ChipPackage[] = [
    { chips: 130, price: 100, colorClass: 'chip-130' },
    { chips: 550, price: 360, colorClass: 'chip-550' },
    { chips: 1040, price: 800, colorClass: 'chip-1040' },
    { chips: 3250, price: 3000, colorClass: 'chip-3250' },
    { chips: 5000, price: 4400, colorClass: 'chip-5000' },
    { chips: 8600, price: 7100, colorClass: 'chip-8600' },
    { chips: 17400, price: 16000, colorClass: 'chip-17400' }
  ];

  const handlePurchase = (pkg: ChipPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Process the purchase
    if (selectedPackage) {
      // Get current chips
      const currentChips = parseInt(localStorage.getItem('pokerChips') || '1000');
      const newChips = currentChips + selectedPackage.chips;
      
      // Update localStorage
      localStorage.setItem('pokerChips', newChips.toString());
      
      // Dispatch custom event to update chip counter
      const event = new CustomEvent('chipUpdate', { detail: { chips: newChips } });
      window.dispatchEvent(event);
      
      // Close modal and show success message
      setIsModalOpen(false);
      toast.success("Purchase Successful!", {
        description: `${selectedPackage.chips} chips have been added to your account.`,
        duration: 5000,
      });
      
      // Reset form
      setFormData({ cardNumber: '', expiry: '', cvv: '' });
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
      <ChipCounter />
      
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <button 
            onClick={() => navigate('/')}
            className="bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Buy Chips</h1>
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {chipPackages.map((pkg, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 flex flex-col items-center">
                <div className={`chip ${pkg.colorClass} mb-4`}>
                  {pkg.chips}
                </div>
                <h3 className="text-xl font-bold mb-2">{pkg.chips.toLocaleString()} Chips</h3>
                <p className="text-poker-gold text-2xl font-medium mb-6">${pkg.price.toLocaleString()}</p>
                <button
                  onClick={() => handlePurchase(pkg)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-green-500/20 hover:scale-105"
                >
                  Purchase Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Payment Modal */}
      {isModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl border border-white/10 max-w-md w-full mx-auto overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className={`chip ${selectedPackage.colorClass} mb-2`}>
                  {selectedPackage.chips}
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{selectedPackage.chips.toLocaleString()} Chips</h3>
                <p className="text-poker-gold text-2xl font-medium">${selectedPackage.price.toLocaleString()}</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm text-zinc-400 mb-1">Card Number</label>
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-poker-red/50"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm text-zinc-400 mb-1">Expiry Date</label>
                      <input
                        id="expiry"
                        name="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-poker-red/50"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm text-zinc-400 mb-1">CVV</label>
                      <input
                        id="cvv"
                        name="cvv"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-poker-red/50"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-green-500/20 shine-effect"
                >
                  Confirm Payment
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BuyChips;
