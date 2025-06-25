// backend/services/auth-go/main.go
package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

type LoginPayload struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type User struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

var ctx = context.Background()

func reportHealth(rdb *redis.Client) {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		// Set a key in Redis like "health:auth-go" with a value and an expiration.
		// The expiration ensures stale services disappear from the dashboard.
		err := rdb.Set(ctx, "health:auth-go", "healthy", 30*time.Second).Err()
		if err != nil {
			fmt.Println("Failed to report health to Redis:", err)
		}
	}
}

func main() {
	// Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: "flexible-pug-51108.upstash.io:6379", // Use the Docker service name
		Password: "AcekAAIjcDE4NjEzY2QxZjRlNjg0N2E3YjNhYWZhYjgxYmRiY2U0MXAxMA", 
		DB: 0,
		TLSConfig: &tls.Config{
			
		},
	})
    
    // Start the health reporting goroutine
	go reportHealth(rdb)
    r := gin.Default()

    r.POST("/api/v1/auth/login", func(c *gin.Context) {
        var payload LoginPayload
        if err := c.ShouldBindJSON(&payload); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
            return
        }

        // In a real app, you would query a database and check hashed passwords.
        if payload.Email == "dandi@atlas.dev" && payload.Password == "password123" {
            // In a real app, you would generate and return a JWT here.
            // For now, we return user info to be consumed by NextAuth.
            c.JSON(http.StatusOK, User{ID: "1", Name: "Dandi Gilang Ramadhan", Email: "dandi@atlas.dev"})
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        }
    })

    r.Run(":8080") // Run on port 8080
}