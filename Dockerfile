FROM node:22-alpine

# Set workdir:
WORKDIR /usr/src/app

# Enable PNPM:
RUN corepack enable

# Install dependencies:
COPY prisma ./
COPY package*.json ./
RUN pnpm install

# Copy all files:
COPY . .

# Run server:
CMD pnpm run start