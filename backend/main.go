package main

import (
	"fmt"

	"todo_app/app/controllers"
	"todo_app/app/models"
)

func main() {
	if models.Db == nil {
		fmt.Println("Error: Database connection failed")
		return
	}
	fmt.Printf("Database connected: %v\n", models.Db)

	fmt.Println("Starting server on port 8080...")
	err := controllers.StartMainServer()
	if err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
	}
}
