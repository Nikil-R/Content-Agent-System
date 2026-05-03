# Step 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy lock files first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Set build-time environment variable for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Step 2: Serve stage
FROM nginx:alpine

# Copy custom nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]