FROM --platform=linux/amd64 node:20-alpine
RUN mkdir -p /opt/telemetry
ADD src /opt/telemetry/
WORKDIR /opt/telemetry/
RUN ls -all /opt/telemetry/
CMD ["node", "app.js", "&"]