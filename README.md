# ImpactConnect: AI-Driven Community Resource Command Center

ImpactConnect is a high-performance, production-ready platform designed for NGOs to digitize community needs and intelligently allocate volunteer resources using **Google Gemini AI** and **Real-Time Analytics**.

![Project Header](https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features

*   **🧠 AI-Powered Ingestion:** Uses **Gemini 1.5 Flash** to parse raw field reports and paper surveys into structured data with logical reasoning.
*   **⚖️ Smart Matching Engine:** Advanced algorithm that ranks volunteers based on **Skill Matching (60%)**, **Proximity (30%)**, and **Availability (10%)**.
*   **🗺️ Interactive Spatial Maps:** Live mapping via **Leaflet.js** showing real-time community hotspots and facility markers.
*   **📈 Impact Analytics:** Professional reporting tools with **CSV Export** and **PDF Generation** capabilities.
*   **🏆 Volunteer Gamification:** A rewards system with **Impact Points** and **Achievement Badges** to drive engagement.
*   **🌐 Global Reach:** Full support for **Multi-language (EN/ES/HI)** and **Dark/Light Mode** theme engine.

---

## 🛠️ Local Setup Instructions

Follow these steps to run the project on your local machine:

### 1. Prerequisites
Ensure you have **Git** installed on your system. You can download it from [git-scm.com](https://git-scm.com/).

### 2. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Trisha227/Smart-Volunteer-Resource-Allocation.git
```

### 3. Navigate to the Folder
```bash
cd Smart-Volunteer-Resource-Allocation
```

### 4. Setup API Keys (Optional for AI)
To use the AI Ingestion feature, open `js/aiService.js` and add your **Google Gemini API Key**:
```javascript
this.apiKey = 'YOUR_GEMINI_API_KEY_HERE';
```

### 5. Launch the Application
There is no "npm install" or complex setup needed! Just open the files in your browser:
*   **Public Landing Page:** Open `landing.html`
*   **NGO Dashboard:** Open `index.html`

---

## 🐳 Docker Setup (Optional)

If you prefer to run the project in a container:

1. **Build the Image:**
   ```bash
   docker build -t impact-connect .
   ```
2. **Run the Container:**
   ```bash
   docker run -p 8080:80 impact-connect
   ```
3. **Access:** Open your browser to `http://localhost:8080`.

Alternatively, use **Docker Compose**:
```bash
docker-compose up -d
```

### ☁️ Deploying Docker to the Cloud
You can deploy this container to professional cloud platforms:
*   **Google Cloud Run:** Perfect for this project. Push the image to Google Container Registry and deploy as a serverless service.
*   **AWS Fargate:** Run the container without managing servers.
*   **DigitalOcean App Platform:** Automatically detects the `Dockerfile` and deploys the site.

---

## ☁️ Cloud Deployment (Firebase)

This project is pre-configured for **Firebase Hosting** and **Firestore**.

### Automatic Deployment (CI/CD)
The project includes a GitHub Action in `.github/workflows/`. 
1. Create a Firebase Project.
2. Add your Firebase Service Account JSON to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT_SMART_VOLUNTEER_COORD`.
3. Every `git push` to the `main` branch will automatically deploy the site.

---

## 📄 License
Licensed under the MIT License. Built for social impact.
