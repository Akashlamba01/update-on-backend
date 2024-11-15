# Use Node.js as the base image
FROM node:18

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install FFMPEG and FFPROBE
# RUN apt-get update && apt-get install -y \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# Copy the entire app
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
