# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /app/server .

# Final stage
FROM alpine:latest
WORKDIR /
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]