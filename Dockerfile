# Stage 1: Build Stage
FROM node:22-alpine AS build

# Set working directory for the build process
WORKDIR /

# Copy package.json and yarn.lock files
COPY package*.json yarn.lock ./

# Install dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Stage 2: Production Stage
FROM node:22-alpine AS production

# Set working directory for the production environment
WORKDIR /

# Copy only the necessary package files (without dev dependencies)
COPY package*.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy only the built files from the build stage to the production stage
COPY --from=build /dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application in production mode
CMD ["yarn", "start:prod"]
