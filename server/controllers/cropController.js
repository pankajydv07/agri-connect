const axios = require('axios');

const getCropRecommendation = async (req, res) => {
  try {
    const { 
      soil, 
      season, 
      location, 
      previousCrops, 
      irrigationAvailable,
      landSize,
      soilPh,
      farmingExperience 
    } = req.body;

    // Validate required fields
    if (!soil || !season || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide soil type, season, and location.' 
      });
    }

    // Construct a detailed prompt
    let prompt = `Provide a detailed crop recommendation for a farm with the following characteristics:
- Location: ${location}
- Season: ${season}
- Soil Type: ${soil}`;

    // Add optional information to the prompt if provided
    if (previousCrops) {
      prompt += `\n- Previous Crops: ${previousCrops}`;
    }
    if (irrigationAvailable) {
      prompt += `\n- Irrigation: ${irrigationAvailable}`;
    }
    if (landSize) {
      prompt += `\n- Land Size: ${landSize} acres`;
    }
    if (soilPh) {
      prompt += `\n- Soil pH: ${soilPh}`;
    }
    if (farmingExperience) {
      prompt += `\n- Farmer Experience Level: ${farmingExperience}`;
    }

    prompt += `\n\nPlease provide:
1. Top 3 recommended crops with reasons
2. Expected yield per acre
3. Required irrigation and fertilizer needs
4. Potential challenges and mitigation strategies
5. Crop rotation suggestions based on previous crops (if provided)
6. Additional tips based on the farmer's experience level`;

    const response = await axios.post(
      'https://api.studio.nebius.com/v1/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-fast-LoRa:CropRecommendation-ZIHX',
        temperature: 0,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert agricultural advisor with deep knowledge of crop selection, farming practices, and local agricultural conditions. Provide detailed, practical recommendations tailored to the farmer\'s specific situation.' 
          },
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