FROM node:19

ARG RAILWAY_RUN_UID=0

# Set workdir:
WORKDIR /usr/src/app

# Install dependencies:
COPY prisma ./
COPY package*.json ./
RUN npm install

# Apply SQL migrations:
ARG SQLITE_FILE
RUN npm run db:migration:apply

# Copy all files:
COPY . .

# Run server:
CMD npm run start