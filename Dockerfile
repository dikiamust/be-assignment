FROM node:18.16.1-alpine3.17 AS base

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files to the working directory
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN yarn db:generate

EXPOSE 3000

CMD ["yarn", "run", "start:dev"]
