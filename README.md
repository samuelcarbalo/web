# comandos iniciales

D:
cd D:\app_multitenant_front
D:\app_multitenant_front\env\Scripts\activate
cd web\todomontelibano-pwa
npm run dev

# Crear proyecto con Vite

npm create vite@latest todomontelibano-pwa -- --template react-ts
cd todomontelibano-pwa

# Instalar dependencias

npm install
npm install -D tailwindcss postcss autoprefixer
npm install tailwindcss @tailwindcss/vite
npm install @tanstack/react-query-devtools

npx tailwindcss init -p

# Instalar librerías necesarias

npm install react-router-dom @tanstack/react-query axios zustand lucide-react clsx tailwind-merge
npm install -D @types/node
