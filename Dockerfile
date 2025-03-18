# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all files to the container
COPY . .

# Build the Vite app
RUN npm run build

CMD ["npm", "run", "start"]
