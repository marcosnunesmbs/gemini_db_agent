# Use Node.js 20 as the base image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Command to run the bot
CMD ["npm", "start"]