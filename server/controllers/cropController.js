const axios = require('axios');

const getCropRecommendation = async (req, res) => {
  try {
    const { soil, season, location } = req.body;

    // Validate required fields
    if (!soil || !season || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide soil type, season, and location.' 
      });
    }

    // Construct a smart prompt
    const prompt = `Suggest the best crops to grow in ${location} during ${season} season. The soil type is ${soil}.`;

    const response = await axios.post(
      'https://api.studio.nebius.com/v1/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-fast-LoRa:CropRecommendation-ZIHX',
        temperature: 0,
        messages: [
          { role: 'system', content: 'You are a helpful crop recommendation assistant.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnaXRodWJ8MTU3Njg2Mzc4Iiwic2NvcGUiOiJvcGVuaWQgb2ZmbGluZV9hY2Nlc3MiLCJpc3MiOiJhcGlfa2V5X2lzc3VlciIsImF1ZCI6WyJodHRwczovL25lYml1cy1pbmZlcmVuY2UuZXUuYXV0aDAuY29tL2FwaS92Mi8iXSwiZXhwIjoxOTAyNzk3MDk2LCJ1dWlkIjoiYTg2ZDEyMzUtNjc0OC00MDAyLTgyOTEtZDJhYzI2ZWMzZTUwIiwibmFtZSI6IlBBTktBSiIsImV4cGlyZXNfYXQiOiIyMDMwLTA0LTE5VDAyOjQ0OjU2KzAwMDAifQ.H6mycVqZy0zRfwnyJc4qSiFD_hG3lj1r4cLKcctWBnw'
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Invalid response format from Nebius API:', response.data);
      return res.status(500).json({ 
        error: 'Invalid response from crop recommendation service.' 
      });
    }

    const recommendation = response.data.choices[0].message.content;
    res.json({ recommendation });

  } catch (err) {
    console.error('Error in crop recommendation:', err.response ? err.response.data : err);
    
    // Handle specific error cases
    if (err.response) {
      if (err.response.status === 401) {
        return res.status(500).json({ 
          error: 'Authentication error with crop recommendation service.' 
        });
      }
      if (err.response.status === 404) {
        return res.status(500).json({ 
          error: 'Crop recommendation service not found.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch crop recommendation. Please try again later.' 
    });
  }
};

module.exports = {
  getCropRecommendation
}; 