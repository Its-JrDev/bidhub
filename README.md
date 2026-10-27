# bidhub

A React + Vite application built with feature-based.

This project is set up with ESLint + Prettier for code quality.

## Built With

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Getting Started

```sh
npm install
npm run dev
```

## Scripts

| Script                 | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start development server        |
| `npm run build`        | Build for production            |
| `npm run preview`      | Preview production build        |
| `npm run lint`         | Run ESLint                      |
| `npm run lint:fix`     | Run ESLint with auto-fix        |
| `npm run format`       | Format code                     |
| `npm run format:check` | Verify code is formatted        |
| `npm run typecheck`    | Type-check the project (tsc -b) |

## Project Structure

<!-- TODO: Update this to match your actual structure -->

```
src/
├── app/          # App shell and global providers
    ├── App.tsx
    ├── contexts/   # React context objects (createContext)
    ├── providers/  # Provider components (ThemeProvider, ...)
    └── hooks/      # Hooks that read the contexts (useTheme, ...)
├── features/     # Feature modules (pages, hooks, api, types)
│   └── home/     # Example feature (components, services, types, store)
└── shared/       # Reusable, business-agnostic resources
    ├── components/ # Shared UI components
    ├── hooks/    # Shared custom hooks
    ├── layouts/  # High-level layout wrappers
    ├── stores/   # Global state stores
    ├── styles/   # globals.css (framework directives) + themes.css
    ├── types/    # Global type definitions
    └── utils/    # Pure utility functions
```

## Authors

- **Your Name** - [@your_twitter](https://twitter.com/your_twitter) - your@email.com

See also the list of [contributors](https://github.com/your_username/bidhub/graphs/contributors) who participated in this project.

## License

Distributed under the MIT License. See `LICENSE` for more information.
