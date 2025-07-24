FROM node:20

# App directory
WORKDIR /app

# Copy files
COPY package*.json ./
COPY server.js ./
COPY views/ ./views/

# Install dependencies
RUN npm install

COPY . .

# Expose port and start app
EXPOSE 80
CMD ["npm", "start"]
