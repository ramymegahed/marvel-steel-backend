# ── Stage 1: Build the React/Vite app ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the API URL at build time so Vite can embed it into the bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Install deps — use ci for reproducibility
# --ignore-scripts skips native postinstall steps (e.g. @tailwindcss/oxide)
# that fail on Alpine; Vite/Tailwind work fine without them at build time.
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# Copy built files — Vite outputs to `dist/` (NOT `build/`)
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA (React Router) support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
