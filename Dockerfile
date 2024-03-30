FROM node:19

# Set workdir:
WORKDIR /usr/src/app

# Install dependencies and generate Prisma client:
COPY prisma ./
COPY package*.json ./
RUN npm install
RUN npm run db:generate

# Apply SQL migrations:
ARG SQLITE_FILE
RUN npm run db:migration:apply

# Copy all files:
COPY . .

# Run server:
CMD npm run start