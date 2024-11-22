# Steamer

A Next.js application for managing and displaying Steam screenshots and friends.

## Features

- Steam OpenID Authentication
- Screenshot Gallery
- Friends List with Real-time Status
- Responsive Dashboard
- Dark Mode Support

## Environment Setup

The application uses different environment configurations for development and production:

### Development

Create `.env.local` for local development:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
STEAM_API_KEY=your_steam_api_key
NODE_ENV=development
```

### Production

Set up environment variables in your hosting platform (e.g., Vercel):

```env
NEXT_PUBLIC_APP_URL=https://steamer.vercel.app
NEXT_PUBLIC_API_URL=https://steamer.vercel.app/api
STEAM_API_KEY=your_steam_api_key
NODE_ENV=production
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Steam Authentication

- Secure OpenID authentication with Steam
- Session management with HTTP-only cookies
- Automatic environment URL handling

### Dashboard

- View and manage Steam screenshots
- See friends list with real-time status
- View friend's current game status
- Quick access to Steam profiles

### Screenshots

- View all your Steam screenshots
- Full-size image viewing
- Screenshot details including date and game
- Responsive grid layout

### Friends List

- Real-time friend status
- Current game information
- Profile links
- Status indicators
- Friend since date

## API Routes

- `/api/auth/steam` - Steam authentication
- `/api/auth/steam/return` - Authentication callback
- `/api/auth/steam/user` - Current user data
- `/api/steam/screenshots` - User screenshots
- `/api/steam/friends` - Friends list

## Development

### Project Structure

```
src/
  ├── app/              # Next.js app router
  │   ├── api/         # API routes
  │   ├── dashboard/   # Dashboard page
  │   └── steam/      # Steam profile page
  ├── components/      # React components
  ├── config/         # Configuration
  ├── hooks/          # Custom hooks
  ├── services/       # API services
  ├── types/          # TypeScript types
  └── utils/          # Utility functions
```

### Key Components

- `FriendCard`: Displays friend information and status
- `Navigation`: Main navigation with Steam login
- `Dashboard`: Main dashboard with screenshots and friends

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project as a template for your own Steam integration.
