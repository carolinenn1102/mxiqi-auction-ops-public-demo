FROM node:24-alpine
WORKDIR /app
COPY . /app
ENV NODE_ENV=production
ENV LOGISTICS_DATA_DIR=/data
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 8080
CMD ["node", "logistics-gateway/server.mjs"]
