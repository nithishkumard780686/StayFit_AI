# Use lightweight Node.js 20 base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first for cached dependency installation
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Hugging Face Spaces exposes port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start server
CMD ["npm", "start"]
