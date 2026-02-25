// Backend API endpoint for ML detection
// Connects to Python ML service running on port 5000

const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

router.post('/detect-cocolumber', async (req, res) => {
  try {
    const { image } = req.body; // Base64 image data
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    console.log('🔍 Detection request received, forwarding to ML service...');
    console.log('📡 ML Service URL:', ML_SERVICE_URL);
    
    // Call the Python ML service
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, 
        { image }, 
        { timeout: 30000 }
      );
      
      console.log('✅ ML Service response:', response.data);
      return res.json(response.data);
      
    } catch (mlError) {
      console.error('❌ ML Service error:', mlError.message);
      
      // If ML service is down, return error
      if (mlError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'ML Service unavailable',
          message: 'Please start the ML service: python ml-service/app.py',
          service_url: ML_SERVICE_URL
        });
      }
      
      throw mlError;
    }
    
  } catch (error) {
    console.error('❌ Detection error:', error);
    res.status(500).json({ 
      message: 'Detection failed', 
      error: error.message 
    });
  }
});

module.exports = router;
