FROM node:18-alpine as build

WORKDIR /app

# Allow selecting an env file at build time (defaults to .env)
ARG ENV_FILE=.env
ENV ENV_FILE=${ENV_FILE}

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application
COPY . .

# Build the application with selected env file
RUN npx env-cmd -f ${ENV_FILE} npm run build

# Production stage
FROM nginx:stable-alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure proper MIME types are available
RUN apk add --no-cache nginx-mod-http-headers-more

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 