# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json /tmp/

# Install app dependencies
RUN npm install

# Copy the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 80

# Install MySQL client
RUN apt-get update && apt-get install -y default-mysql-client

# Change ownership of the directory
# RUN chown -R root:root /docker-entrypoint-initdb.d/

# Define the command to run your application
CMD ["npm", "start"]
