# Use the official image as a parent image
FROM node:current-slim

# Set the working directory
WORKDIR /usr/src/bing-wallpaper

# Copy the file from your host to your current location
COPY . .

# Run the command inside your image filesystem
# RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
# RUN cnpm install

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 5000

# Copy the rest of your app's source code from your host to your image filesystem.
# COPY app.js .

# RUN npm run prod

# Run the specified command within the container.
CMD [ "node", "app.js" ]