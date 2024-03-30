FROM node:19

# Set workdir:
WORKDIR /usr/src/app

# Use env variables:
ARG POSTGRES_URL

# Install dependencies:
COPY prisma ./
COPY package*.json ./
RUN npm install

# Apply SQL migrations:
RUN npm run db:migration:apply

# Copy all files:
COPY . .

# Run server:
CMD npm run start