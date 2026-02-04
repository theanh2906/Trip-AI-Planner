# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Build argument for Gemini API key (required at build time)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (API key is injected via Vite define)
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3010
EXPOSE 3010

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
