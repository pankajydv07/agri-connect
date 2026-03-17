# agri-connect
# Agri-Connect 🌾

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/pankajydv07/agri-connect/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange)](https://github.com/pankajydv07/agri-connect/releases)

> A comprehensive digital platform connecting farmers, buyers, and agricultural service providers to revolutionize the agricultural supply chain.

## 🌱 Overview

Agri-Connect bridges the gap between agricultural producers and consumers, providing real-time market data, seamless crop listings, and direct communication channels. Our platform empowers farmers with technology to maximize their profits while ensuring buyers get quality produce at fair prices.

## ✨ Key Features

- **📊 Crop Listings & Marketplace**: List and browse agricultural products with detailed specifications
- **💰 Real-time Price Tracking**: Live market prices and historical trend analysis
- **🤝 Direct Farmer-Buyer Connection**: Eliminate middlemen with direct communication channels
- **📱 Mobile-First Design**: Responsive interface optimized for rural connectivity
- **🔍 Advanced Search & Filters**: Find products by location, category, price range, and quality grade
- **📈 Analytics Dashboard**: Track sales, inventory, and market trends
- **🔐 Secure Authentication**: Role-based access for farmers, buyers, and administrators
- **🌐 Multi-language Support**: Regional language support for better accessibility

## 🛠️ Tech Stack

- **Frontend**: React.js, Redux, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB / PostgreSQL
- **Authentication**: JWT, OAuth 2.0
- **Cloud Storage**: AWS S3 / Cloudinary
- **Real-time**: Socket.io
- **Testing**: Jest, Cypress

## 🚀 Installation

### Prerequisites

- Node.js (v14.0 or higher)
- npm or yarn
- MongoDB (v4.4 or higher) or PostgreSQL
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/pankajydv07/agri-connect.git
   cd agri-connect
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/agri-connect
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Database Setup**
   ```bash
   # If using MongoDB locally
   mongod

   # Or configure MongoDB Atlas connection string in .env
   ```

5. **Run the application**
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Usage

### For Farmers

1. Register as a farmer account
2. Complete profile with farm details and location
3. Add crop listings with images, quantity, and expected price
4. Manage inventory through the dashboard
5. Respond to buyer inquiries and negotiate prices

### For Buyers

1. Create a buyer account
2. Browse available crops using filters
3. View farmer profiles and ratings
4. Contact farmers directly through the platform
5. Track orders and payment status

### API Example

```javascript
// Get all crop listings
GET /api/v1/crops?page=1&limit=10&category=vegetables

// Response
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Organic Tomatoes",
      "farmer": "John Doe",
      "price": 25.00,
      "unit": "kg",
      "location": "Punjab, India",
      "available": true
    }
  ]
}
```

## 📚 API Documentation

Detailed API documentation is available at:
- [API Docs](https://documenter.getpostman.com/view/your-api-docs)
- [Swagger UI](http://localhost:5000/api-docs) (when running locally)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Project Maintainer**: Pankaj Kumar
- **Email**: pankajydv07@example.com
- **GitHub Issues**: [Create an issue](https://github.com/pankajydv07/agri-connect/issues)
- **Discord Community**: [Join our server](https://discord.gg/agri-connect)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Agricultural data sources and market research teams
- Open source community for the amazing tools and libraries

---

<p align="center">Made with ❤️ for the farming community</p>
