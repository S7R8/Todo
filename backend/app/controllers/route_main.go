package controllers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"todo_app/app/models"
)

func index(w http.ResponseWriter, r *http.Request) {
	sess, err := session(w, r)
	if err != nil {
		log.Printf("Session error: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	user, err := sess.GetUserBySession()
	if err != nil {
		log.Printf("GetUserBySession error: %v", err)
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	todos, err := user.GetTodosByUser()
	if err != nil {
		log.Printf("GetTodosByUser error: %v", err)
		http.Error(w, "Failed to get todos", http.StatusInternalServerError)
		return
	}

	// Transform todos to include all fields
	var todosResponse []map[string]interface{}
	for _, todo := range todos {
		todosResponse = append(todosResponse, map[string]interface{}{
			"ID":        todo.ID,
			"Content":   todo.Content,
			"UserID":    todo.UserID,
			"Priority":  todo.Priority,
			"Status":    todo.Status,
			"DueDate":   todo.DueDate,
			"CreatedAt": todo.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status": "success",
		"todos":  todosResponse,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	}
	json.NewEncoder(w).Encode(response)
}

func todoSave(w http.ResponseWriter, r *http.Request) {
	sess, err := session(w, r)
	if err != nil {
		log.Printf("Session error in todoSave: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := sess.GetUserBySession()
	if err != nil {
		log.Printf("GetUserBySession error in todoSave: %v", err)
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Body read error: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	var req struct {
		Content  string `json:"content"`
		Priority string `json:"priority"`
		DueDate  string `json:"dueDate"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		log.Printf("JSON unmarshal error: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := user.CreateTodo(req.Content, req.Priority, req.DueDate); err != nil {
		log.Printf("CreateTodo error: %v", err)
		http.Error(w, "Failed to create todo", http.StatusInternalServerError)
		return
	}

	// JSON レスポンス
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status":  "success",
		"message": "Todo created successfully",
	}
	json.NewEncoder(w).Encode(response)
}

func todoUpdate(w http.ResponseWriter, r *http.Request, id int) {
	sess, err := session(w, r)
	if err != nil {
		log.Printf("Session error in todoUpdate: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := sess.GetUserBySession()
	if err != nil {
		log.Printf("GetUserBySession error in todoUpdate: %v", err)
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Body read error in todoUpdate: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	var req struct {
		Content  string `json:"content"`
		Priority string `json:"priority"`
		Status   string `json:"status"`
		DueDate  string `json:"dueDate"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		log.Printf("JSON unmarshal error in todoUpdate: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// デフォルト値の設定
	if req.Priority == "" {
		req.Priority = "medium"
	}
	if req.Status == "" {
		req.Status = "todo"
	}
	if req.DueDate == "" {
		req.DueDate = time.Now().Format("2006-01-02")
	}

	t := models.Todo{
		ID:       id,
		Content:  req.Content,
		UserID:   user.ID,
		Priority: req.Priority,
		Status:   req.Status,
		DueDate:  req.DueDate,
	}
	if err := t.UpdateTodo(); err != nil {
		log.Printf("UpdateTodo error: %v", err)
		http.Error(w, "Failed to update todo", http.StatusInternalServerError)
		return
	}

	// JSON レスポンス
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status":  "success",
		"message": "Todo updated successfully",
	}
	json.NewEncoder(w).Encode(response)
}

func todoDelete(w http.ResponseWriter, r *http.Request, id int) {
	sess, err := session(w, r)
	if err != nil {
		log.Printf("Session error in todoDelete: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	_, err = sess.GetUserBySession()
	if err != nil {
		log.Printf("GetUserBySession error in todoDelete: %v", err)
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	t, err := models.GetTodo(id)
	if err != nil {
		log.Printf("GetTodo error in todoDelete: %v", err)
		http.Error(w, "Todo not found", http.StatusNotFound)
		return
	}

	if err := t.DeleteTodo(); err != nil {
		log.Printf("DeleteTodo error: %v", err)
		http.Error(w, "Failed to delete todo", http.StatusInternalServerError)
		return
	}

	// JSON レスポンス
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status":  "success",
		"message": "Todo deleted successfully",
	}
	json.NewEncoder(w).Encode(response)
}
