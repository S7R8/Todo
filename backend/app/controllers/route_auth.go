package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"todo_app/app/models"
)

func signup(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var req models.SignupRequest
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&req); err != nil {
			log.Println("JSON decode error:", err)
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		user := &models.User{
			Name:     req.Name,
			Email:    req.Email,
			Password: req.Password,
		}

		if err := user.CreateUser(); err != nil {
			log.Printf("CreateUser error: %v", err)
			http.Error(w, "User creation failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{
			"status":  "success",
			"message": "User created successfully",
		}
		json.NewEncoder(w).Encode(response)
	}
}

func authenticate(w http.ResponseWriter, r *http.Request) {
	var req models.AuthRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Println("JSON decode error:", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	user, err := models.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("GetUserByEmail error: %v", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	if user.Password == models.Encrypt(req.Password) {
		session, err := user.CreateSession()
		if err != nil {
			log.Printf("CreateSession error: %v", err)
			http.Error(w, "Session creation failed", http.StatusInternalServerError)
			return
		}
		cookie := http.Cookie{
			Name:     "_cookie",
			Value:    session.UUID,
			HttpOnly: true,
			Path:     "/",
			SameSite: http.SameSiteLaxMode,
			Secure:   false, // 開発環境
		}
		http.SetCookie(w, &cookie)

		log.Printf("Session created successfully: %s for user %s", session.UUID, user.Email)

		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"status": "success",
			"user": map[string]interface{}{
				"id":    user.ID,
				"name":  user.Name,
				"email": user.Email,
			},
		}
		json.NewEncoder(w).Encode(response)
	} else {
		log.Printf("Password mismatch for email: %s", req.Email)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	}
}

func logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("_cookie")
	if err != nil {
		log.Printf("Cookie error in logout: %v", err)
	}

	if err != http.ErrNoCookie {
		session := models.Session{UUID: cookie.Value}
		session.DeleteSessionByUUID()
		log.Printf("Session deleted: %s", cookie.Value)
	}

	// Cookieを削除
	http.SetCookie(w, &http.Cookie{
		Name:   "_cookie",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})

	// JSON レスポンス
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status":  "success",
		"message": "Logged out successfully",
	}
	json.NewEncoder(w).Encode(response)
}
