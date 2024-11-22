# SteamShare

Steam screenshot management platform with integrated gallery organization and canvas editing. Built with Next.js 14 and created using [next-temploot](https://github.com/JayRichh/next-temploot). 

Features seamless Steam authentication, real-time friend activity, and advanced collage creation tools.

[Visit SteamShare Here!](https://steamshare.net).

## Core Features

- **Steam Integration** - Seamless login, screenshot sync, and friend activity
- **Screenshot Gallery** - Browse and manage your Steam screenshots
- **Canvas Editor** - Professional editing tools powered by Fabric.js
- **Friend System** - View and interact with Steam friends' content

![image](https://github.com/user-attachments/assets/5c6d815f-eed2-4f71-b7fd-4c04dce958ab)

## Project Structure

```
src/
├── app/              # Next.js app router
│   ├── dashboard/    # Screenshot management
│   ├── editor/      # Canvas editor
│   ├── steam/       # Steam integration
│   └── api/         # API endpoints
├── components/       # React components
├── context/         # React context
├── hooks/           # Custom hooks
├── tools/           # Canvas tools
│   ├── drawing/     # Drawing tools
│   └── filters/     # Image filters
└── types/           # TypeScript types
```

## Tech Stack

- **Framework** - Next.js 14, React 18
- **Canvas** - Fabric.js 6.5
- **Styling** - Tailwind CSS, Framer Motion
- **Forms** - React Hook Form, Zod
- **UI** - Lucide Icons, CVA
- **Dev Tools** - TypeScript, ESLint, Prettier

![image](https://github.com/user-attachments/assets/8c57b392-2fb4-476c-9f3c-5af4210f2c44)

## Development

```bash
npm install
npm run dev
```

Requires `STEAM_API_KEY` in `.env.local`

## License

MIT
