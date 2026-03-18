# 🌾 Agri-Connect
<div align="center">
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/pankajydv07/agri-connect)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange)](https://github.com/pankajydv07/agri-connect/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)

**Connecting Farmers, Buyers, and Agricultural Experts for a Sustainable Future**
[Live Demo](https://agri-connect-demo.com) • [Documentation](https://docs.agri-connect.com) • [Report Bug](https://github.com/pankajydv07/agri-connect/issues)
</div>
---
## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
---
## 🌱 About
Agri-Connect is a comprehensive digital platform designed to bridge the gap between farmers, buyers, and agricultural experts. Our mission is to empower the agricultural community by providing tools for direct trade, knowledge sharing, and resource optimization.
Whether you're a farmer looking to sell crops directly to consumers, a buyer seeking fresh produce, or an expert wanting to share knowledge, Agri-Connect provides the infrastructure for seamless agricultural collaboration.
---
## ✨ Features
### 👥 User Management
- **Multi-role Registration**: Separate portals for Farmers, Buyers, and Agricultural Experts
- **Profile Management**: Detailed profiles with verification badges
- **Secure Authentication**: JWT-based authentication with role-based access control
### 🌽 Marketplace
- **Crop Listings**: Farmers can list crops with images, descriptions, and pricing
- **Advanced Search**: Filter by location, crop type, price range, and availability
- **Real-time Inventory**: Track available stock and seasonal produce
- **Price Comparison**: Historical price data and market trends
### 💬 Communication
- **Direct Messaging**: Real-time chat between farmers and buyers
- **Expert Consultation**: Book appointments with agricultural experts
- **Community Forums**: Discussion boards for farming tips and market insights
### 🚜 Equipment Sharing
- **Equipment Listing**: Rent out or lease farming equipment
- **Booking System**: Schedule equipment usage with calendar integration
- **Maintenance Tracking**: Log and track equipment maintenance history
### 📊 Analytics & Insights
- **Weather Updates**: Real-time weather forecasts and alerts
- **Price Tracking**: Market price trends and predictions
- **Crop Recommendations**: AI-based suggestions based on soil and weather data
---
## 🛠 Tech Stack
### Frontend
- **React.js** (v18+) - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.io-client** - Real-time communication
- **Chart.js** - Data visualization
### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
### Database
- **MongoDB** - Primary database
- **Mongoose** - ODM (Object Data Modeling)
- **Redis** - Caching and session storage
### Cloud & APIs
- **AWS S3 / Cloudinary** - Image storage
- **OpenWeatherMap API** - Weather data
- **Twilio** - SMS notifications
- **SendGrid** - Email services
### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy
- **PM2** - Process management
---
## 🚀 Installation
### Prerequisites
Ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn
- MongoDB (v4.4 or higher)
- Git
### Clone Repository
```bash
# Clone the repository
# Navigate to project directory
### Backend Setup
```bash
# Navigate to backend directory
# Install dependencies
# Create environment file
# Edit .env with your configurations
# Run database migrations (if applicable)
# Seed initial data (optional)
# Start development server
### Frontend Setup
```bash
# Navigate to frontend directory (from root)
# Install dependencies
# Create environment file
# Start development server
The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
---
## 🔧 Environment Variables
Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
# Database
# JWT Secret
---
## 📖 Usage
### For Farmers
1. **Register**: Create an account selecting "Farmer" as your role
2. **Complete Profile**: Add farm details, location, and verification documents
3. **List Products**: Navigate to Marketplace → Add Listing
4. **Manage Orders**: View incoming orders in the Dashboard
5. **Equipment Sharing**: List available equipment under Equipment tab
### For Buyers
1. **Browse Marketplace**: Search for specific crops or browse categories
2. **Connect**: Message farmers directly for negotiations
3. **Place Orders**: Add items to cart and checkout
4. **Track Delivery**: Monitor order status in real-time
5. **Rate & Review**: Leave feedback after transaction completion
### For Experts
1. **Verification**: Submit credentials for expert verification
2. **Consultation Setup**: Set availability and consultation fees
3. **Answer Queries**: Participate in community forums
4. **Write Articles**: Publish agricultural best practices and tips
---
## 📚 API Documentation
### Authentication Endpoints
| Method | Endpoint | Description |
### Marketplace Endpoints
| Method | Endpoint | Description |
### Messaging Endpoints
| Method | Endpoint | Description |
### Equipment Endpoints
| Method | Endpoint | Description |
For complete API documentation, visit: [https://docs.agri-connect.com/api](https://docs.agri-connect.com/api)
---
## 🤝 Contributing
We welcome contributions from the community! Here's how you can help:
### Getting Started
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
### Branch Naming Conventions
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
### Code Style
- Follow ESLint and Prettier configurations
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add comments for complex logic
- Write unit tests for new features
- Ensure all tests pass before submitting PR
### Pull Request Process
1. Update the README.md with details of changes if applicable
2. Update the documentation with details of changes to the interface
3. Ensure your code follows our coding standards
4. Link any relevant issues in the PR description
5. Request review from maintainers
---
## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
Copyright (c) 2024 Agri-Connect Contributors
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
---
## 📞 Contact & Support
### Maintainers
- **Pankaj Yadav** - Project Lead - [@pankajydv07](https://github.com/pankajydv07)
### Community
- 💬 [Discord Community](https://discord.gg/agri-connect)
- 🐦 [Twitter: @AgriConnect](https://twitter.com/AgriConnect)
- 📧 Email: support@agri-connect.com
### Reporting Issues
Found a bug or have a feature request? Please open an issue:
1. Check if the issue already exists
2. Create a new issue with a descriptive title
3. Provide steps to reproduce (for bugs)
5. Tag with appropriate labels
### Support
For commercial support or custom implementations, contact us at:
📧 enterprise@agri-connect.com
---
<div align="center">
**Made with 💚 for the farming community**
[⬆ Back to Top](#-agri-connect)
</div>
