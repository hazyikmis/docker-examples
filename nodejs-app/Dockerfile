# Specify base image
#FROM alpine
FROM node:alpine

WORKDIR /usr/app

# Install dependencies
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Default command
CMD ["npm", "start"]

# FROM alpine
# RUN npm Install
# CMD ["npm", "start"]
# problem 1
# IF we build this file with the command "docker build ."
# we get the error: "/bin/sh: npm: not found"
# There is 2 solutions:
#   1-Use another base image contains "npm", or node preinstalled in it
#   2-Use alpine, but first install "npm"
# problem 2
# After fixing the base image, from "alpine" to "node/alpine"
# we get another error: no such file or directory, open '/package.json'
# So, we need to copy package.json and all other sour source code to the image
# before "RUN npm install"
# "COPY ./ ./" means copy everything from current build directory to the containers current working directory
# But this is not a got approach (sending files to the container without specifying an app folder)
# Its better to add "WORKDIR usr/app" before the COPY command.
# By adding this command before COPY,  "COPY ./ ./" means copy from the host's current dir to the containers "/." directory.
# actually means, "/usr/app/". 
# After adding COPY command, we get a warning about the package-lock.json, but
# this is totally fine.
# To build (thats better): docker build -t hazyikmis/nodesimpleapp .
# finally to run: docker run hazyikmis/nodesimpleapp
# problem 3
# http//localhost:8080 cannot be reachable
# So need to stop/kill the running container and restart it with -p parameter
# docker run -p 8080:8080 hazyikmis/nodesimpleapp

# INVALIDATING THE CACHE
# When you make changes on your source code, and then re-run the docker build command,
# "RUN npm install" runs and downloads&install everything again. Because just the line above
# "COPY ./ ./" detects changes on your index.js or any other file, and then clears the cache and runs
# all other commands in this Dockerfile. But, the only thing requiring to re-run "RUN npm install"
# is changes in the package.json. If you did not install/remove any dependency you definitily do not
# need to run "RUN npm install". As a result, in order NOT TO CLEAR the cache, and not to reinstall 
# everything WE CAN MAKE A VERY CLEVER CHANGE ON THIS FILE:

# rather than
# COPY ./ ./
# RUN npm install

# use that one
# COPY ./package.json ./
# RUN npm install
# COPY ./ ./

# By copying first, package.json, docker builder checks if there is any change in the packqge.json,
# if not then use directly cache, nothing to re-run "RUN npm install"