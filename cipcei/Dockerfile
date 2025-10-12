# Use the official Node.js image as the base image
FROM node:20

# Install pnpm globally
RUN corepack enable pnpm && corepack install -g pnpm@latest

RUN useradd -ms /bin/sh -u 1001 app

USER app

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml* ./

# Install the application dependencies
RUN pnpm install 

# Copy the rest of the application files
COPY --chown=app:app . .

# Expose the application port
EXPOSE 3000

ENTRYPOINT ["tail", "-f", "/dev/null"]
