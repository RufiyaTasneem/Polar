# POLAR Science Outreach Platform

An integrated web platform for polar science exploration, knowledge retrieval, scientific data access, AI-assisted research support, and public science outreach.

POLAR brings polar stations, expeditions, research documents, media, AI-assisted knowledge retrieval, machine-learning analysis, and content generation into a single platform.

---

# Project Overview

The POLAR Science Outreach Platform is designed around a curated polar science knowledge repository.

The platform allows users to:

- Explore polar research stations
- Explore scientific expeditions
- Access research documents
- Browse polar media and images
- Search polar science knowledge
- Interact with the POLAR AI assistant
- Retrieve context-based scientific information using RAG
- Access station-specific temperature prediction
- Generate scientific outreach content
- Convert research information into website, social media, YouTube, and outreach content

---

# Key Features

## 1. Polar Knowledge Repository

The platform provides a centralized repository for polar science information, including:

- Research documents
- Scientific expeditions
- Polar research stations
- Media and images
- Scientific metadata

Current stations include:

- Maitri Station
- Bharati Station
- Himadri Station

Each station can be connected with relevant research information, expeditions, media, and scientific resources.

---

## 2. POLAR AI

POLAR AI provides knowledge-based responses using Retrieval-Augmented Generation (RAG).

Instead of generating responses without context, the system retrieves relevant information from the POLAR knowledge repository and uses that information to construct the response.

### RAG Workflow

User Query
    |
    v
Query Processing
    |
    v
Embedding Generation
    |
    v
ChromaDB Vector Search
    |
    v
Relevant POLAR Knowledge
    |
    v
Context Construction
    |
    v
Response Generation
    |
    v
Final Response

### RAG Technologies

- ChromaDB
- all-MiniLM-L6-v2
- Vector Embeddings
- Semantic Retrieval
- Retrieval-Augmented Generation
- FastAPI
- Python
- POLAR Knowledge Repository

---

## 3. Polar Research Stations

The platform provides dedicated information for polar research stations.

### Current Stations

- Maitri
- Bharati
- Himadri

Each station can contain:

- Station information
- Research information
- Expeditions
- Media
- Scientific resources

---

## 4. Expedition Information

The platform provides information related to polar expeditions and their associated scientific activities.

Users can explore expedition records through the portal and use the information as a knowledge source for POLAR AI and content generation.

---

## 5. ML Temperature Prediction

The platform includes machine-learning-based temperature prediction for supported polar stations.

### ML Workflow

- Python
- Scikit-learn
- Historical temperature datasets
- Data cleaning
- Feature engineering
- Regression-based prediction
- Station-specific datasets

### Prediction Flow

Historical Station Data
        |
        v
Data Cleaning
        |
        v
Feature Engineering
        |
        v
Scikit-learn Model
        |
        v
Temperature Prediction
        |
        v
POLAR Portal

The current implementation includes station-specific temperature prediction workflows for supported stations.

---

## 6. Content Studio

The Content Studio transforms polar science information into structured outreach content.

### Supported Content Formats

- Website Article
- Instagram Caption
- Social Media Post
- YouTube Description
- Short Video Script
- Outreach Article

### Content Generation Flow

POLAR Knowledge Repository
          |
          v
      POLAR AI / RAG
          |
          v
    Content Generation
          |
    +-----+-----+-----+
    |           |     |
    v           v     v
 Website    Instagram Social Media
    |
    v
 YouTube Description
    |
    v
 Short Video Script
    |
    v
 Outreach Article

---

# Technical Architecture

## Main Technology Stack

- React.js
- TypeScript
- FastAPI
- Python
- Supabase
- PostgreSQL
- ChromaDB
- Scikit-learn

---

# Frontend Architecture

The frontend is built using:

- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Three.js
- GSAP
- ScrollTrigger
- Lucide React

### Frontend Responsibilities

- Main portal interface
- Polar station exploration
- Expedition exploration
- Knowledge repository
- Media section
- POLAR AI interface
- Content Studio
- Temperature prediction interface
- Responsive user interface

---

# Backend Architecture

The backend is built using:

- FastAPI
- Python
- REST APIs
- Supabase
- PostgreSQL

### Backend Responsibilities

FastAPI handles:

- POLAR AI requests
- RAG processing
- Content generation
- ML prediction requests
- Backend API communication
- Knowledge retrieval

---

# AI / ML Architecture

The AI and ML layer includes:

- Scikit-learn
- Temperature prediction models
- Historical scientific datasets
- Feature engineering
- Station-specific prediction workflows
- Retrieval-Augmented Generation

---

# RAG / Knowledge Architecture

The RAG layer uses:

- ChromaDB
- all-MiniLM-L6-v2
- Vector embeddings
- Semantic retrieval
- Curated POLAR knowledge

## RAG Pipeline

User
 |
 v
User Query
 |
 v
Query Validation
 |
 v
Generate Embedding
 |
 v
ChromaDB Search
 |
 v
Retrieve Relevant Data
 |
 v
Build Context
 |
 v
Generate Response
 |
 v
POLAR AI Answer

---

# Database and Storage Architecture

Supabase is used as the primary backend data platform.

## Database

PostgreSQL

## Authentication

Supabase Authentication

## Storage

Supabase Storage

## Main Data Areas

- Stations
- Expeditions
- Documents
- Media

### Supabase Architecture

                    Supabase
                       |
          +------------+------------+
          |            |            |
          v            v            v
     PostgreSQL      Auth        Storage
          |
     +----+----------+----------+
     |               |          |
     v               v          v
 Stations       Expeditions   Documents
                                  |
                                  v
                                Media

---

# Complete System Architecture

                         POLAR SCIENCE PORTAL
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
        React Frontend       FastAPI Backend      Supabase
              |                   |                   |
              |                   |          +--------+--------+
              |                   |          |        |        |
              |                   |          v        v        v
              |                   |     PostgreSQL  Auth    Storage
              |                   |
              |             +-----+-----+
              |             |           |
              |             v           v
              |          POLAR AI    ML Module
              |             |
              |             v
              |           RAG
              |             |
              |             v
              |          ChromaDB
              |             |
              |             v
              |      Relevant Knowledge
              |
              +-----------------------------+
                                            |
                                            v
                                     Content Studio
                                            |
                         +------------------+------------------+
                         |                  |                  |
                         v                  v                  v
                     Website            Instagram        Social Media
                         |
                         v
                      YouTube
                         |
                         v
                  Short Video Script
                         |
                         v
                  Outreach Article

---

# Project Structure

```text
Polar/
│
├── backend/
│   ├── main.py
│   ├── rag.py
│   ├── temperature_ml.py
│   └── datasets/
│       ├── maitri/
│       ├── bharati/
│       └── himadri/
│
├── public/
│   └── images/
│       ├── maitri-station.jpg
│       ├── bharati-station.jpg
│       └── himadri-station.jpg
│
├── src/
│   ├── components/
│   │   ├── ...
│   │
│   ├── pages/
│   │   ├── ...
│   │
│   ├── lib/
│   │   ├── hooks.ts
│   │   ├── supabase.ts
│   │   └── ...
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── package.json
├── vite.config.ts
├── tailwind.config.*
├── tsconfig.json
├── .env
└── README.md
