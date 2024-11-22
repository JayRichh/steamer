# SteamShare

Steam screenshot management platform with integrated gallery organization and canvas editing. Built with Next.js 14 and created using [next-temploot](https://github.com/JayRichh/next-temploot). 

Features seamless Steam authentication, real-time friend activity, and advanced collage creation tools.


## Core Features

- **Steam Integration** - Seamless login, screenshot sync, and friend activity
- **Screenshot Gallery** - Browse and manage your Steam screenshots
- **Canvas Editor** - Professional editing tools powered by Fabric.js
- **Friend System** - View and interact with Steam friends' content

![image](https://github.com/user-attachments/assets/225ededf-a19c-444a-8593-74493304258e)

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

![image](https://github.com/user-attachments/assets/a4e473d7-0387-4d8a-9ac3-9036f577430d)

![image](https://github.com/user-attachments/assets/77590cd8-6ccd-47e0-be80-24d9839e73c6)

## Development

```bash
npm install
npm run dev
```

![image](https://github.com/user-attachments/assets/4ab793f3-eabb-4426-9f1c-996000a735ab)


Requires `STEAM_API_KEY` in `.env.local`

## License

MIT
