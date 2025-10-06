package controllers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	"todo_app/app/models"
	"todo_app/config"
)

func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// CORSミドルウェア関数
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == "OPTIONS" {
			return
		}

		next(w, r)
	}
}

func session(w http.ResponseWriter, r *http.Request) (sess models.Session, err error) {
	cookie, err := r.Cookie("_cookie")
	if err == nil {
		sess = models.Session{UUID: cookie.Value}
		if ok, _ := sess.CheckSession(); !ok {
			err = fmt.Errorf("invalid session")
		}
	}
	return sess, err
}

var validPath = regexp.MustCompile("^/todos/(edit|update|delete)/([0-9]+)/?$")

func parseURL(fn func(http.ResponseWriter, *http.Request, int)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := validPath.FindStringSubmatch(r.URL.Path)
		if q == nil {
			http.NotFound(w, r)
			return
		}
		qi, err := strconv.Atoi(q[2])
		if err != nil {
			http.NotFound(w, r)
			return
		}
		fn(w, r, qi)
	}
}

func StartMainServer() error {
	http.HandleFunc("/signup", corsMiddleware(signup))
	http.HandleFunc("/authenticate", corsMiddleware(authenticate))
	http.HandleFunc("/todos", corsMiddleware(index))
	http.HandleFunc("/logout", corsMiddleware(logout))
	http.HandleFunc("/todos/save", corsMiddleware(todoSave))
	http.HandleFunc("/todos/update/", corsMiddleware(parseURL(todoUpdate)))
	http.HandleFunc("/todos/delete/", corsMiddleware(parseURL(todoDelete)))
	return http.ListenAndServe(":"+config.Config.Port, nil)
}
