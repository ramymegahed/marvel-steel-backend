# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app

# Accept VITE_API_URL build argument from docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
# This compiles the React app into static files in /app/dist
RUN npm run build

# Server stage
FROM nginx:alpine as production-stage

# Copy the built React app to the Nginx HTML directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Overwrite default default.conf to handle React Router SPA routing (fallback to index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
