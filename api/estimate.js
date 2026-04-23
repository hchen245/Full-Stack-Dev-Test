import fs from 'fs';
import path from 'path';

const loadData = (filename) => {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const {
        customerId,
        jobType,
        complexity,
        equipmentIds = [],
        estimatedHours,
        notes = '',
      } = req.body;

      const customers = loadData('customers.json');
      const equipment = loadData('equipment.json');
      const laborRates = loadData('labor_rates.json');

      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }

      const laborRate = laborRates.find(
        lr => lr.jobType === jobType && lr.level === complexity
      );
      if (!laborRate) {
        return res.status(400).json({ error: 'Invalid job type or complexity' });
      }

      const hours = estimatedHours || laborRate.estimatedHours.min;
      const laborCost = hours * laborRate.hourlyRate;

      let equipmentCost = 0;
      const selectedEquipment = [];
      equipmentIds.forEach(eqId => {
        const eq = equipment.find(e => e.id === eqId);
        if (eq) {
          equipmentCost += eq.baseCost;
          selectedEquipment.push({
            id: eq.id,
            name: eq.name,
            cost: eq.baseCost,
          });
        }
      });

      const subtotal = laborCost + equipmentCost;
      const taxRate = 0.08;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const estimate = {
        id: `EST-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customer: {
          id: customer.id,
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
        },
        jobDetails: {
          type: jobType,
          complexity,
          hours,
          notes,
        },
        equipment: selectedEquipment,
        laborCost,
        equipmentCost,
        subtotal,
        tax,
        total,
      };

      res.status(200).json(estimate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
