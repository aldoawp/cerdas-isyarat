# Cerdas Isyarat

An interactive web application designed to facilitate learning Indonesian Sign Language (BISINDO) for children aged 6-18 years old. The application provides an engaging learning experience through child-friendly interfaces, attractive visuals, and interactive features that encourage active participation.

## 🌟 Features

### Core Learning Features
- **Eksplorasi Materi (Material Exploration)**: Learn vocabulary by category with visual presentation, gamification, and assessments
- **Kamus BISINDO**: Complete vocabulary dictionary accessible anytime as additional reference
- **Tebak Gerakan (Guess the Movement)**: Interactive guessing challenges using Computer Vision and AI
- **Assessment System**: Multiple choice and fill-in-the-blank questions to test learning progress

### User Experience Features
- **User Authentication**: Registration, login, and logout with secure data management
- **Onboarding**: Interactive introduction for new users about BISINDO basics
- **Progress Tracking**: Centralized data storage allowing users to continue previous learning sessions
- **Audio Controls**: Toggle soundtrack on/off according to user preferences
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.4.5 with React 19.1.0
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript
- **Code Quality**: ESLint, Prettier, Husky

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
│   ├── shared/           # Shared components across features
│   ├── eksplorasi/       # Exploration feature components
│   ├── kamus/            # Dictionary feature components
│   └── tebak-gerakan/    # Guessing challenge components
├── containers/           # Container components with state management
├── lib/                  # Utilities and custom hooks
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── supabase/        # Supabase configuration
│   └── utils/           # Helper functions
├── repositories/         # Data access layer (CRUD operations)
├── services/            # Business logic layer
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cerdas-isyarat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses Supabase with the following main entities:
- **Users**: User profiles and authentication
- **Users Progress**: Learning progress tracking
- **Exploration**: Learning modules and levels
- **Dictionary**: BISINDO vocabulary categories and details
- **Guessing Challenge**: Interactive challenge content
- **Assets**: Media files (images, videos, audio)

For detailed schema information, see `specs/db-schema.md`.

## 🎯 Target Audience

- **Primary**: Children aged 6-18 years learning BISINDO
- **Secondary**: Parents and teachers supporting children's learning
- **Use Cases**: 
  - Independent learning at home
  - Guided learning with parents/teachers
  - Classroom integration
  - Reference tool for BISINDO vocabulary

## 🎨 Design Philosophy

- **Child-Friendly**: Intuitive interface designed for young learners
- **Visual Learning**: Emphasis on visual presentation and interactive elements
- **Gamification**: Learning through games and challenges
- **Accessibility**: Inclusive design for diverse learning needs
- **Progress Tracking**: Motivation through visible learning progress

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Check code formatting
- `npm run format:fix` - Fix code formatting

## 📚 Documentation

- `specs/overview.md` - Detailed functional and technical overview
- `specs/db-schema.md` - Database schema documentation
- `specs/features/` - Feature-specific documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🎵 Audio

The application includes background music to enhance the learning experience. Audio controls allow users to toggle sound on/off according to their preferences.

---

**Cerdas Isyarat** - Making Indonesian Sign Language learning accessible, engaging, and fun for children everywhere.