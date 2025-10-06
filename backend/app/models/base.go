package models

import (
	"crypto/sha1"
	"database/sql"
	"fmt"
	"log"

	"todo_app/config"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

var Db *sql.DB

var err error

const (
	tableNameUser    = "users"
	tableNameTodo    = "todos"
	tableNameSession = "sessions"
)

func init() {
	log.Println("Initializing database connection...")
	Db, err = sql.Open(config.Config.SQLDriver, config.Config.DbName)
	if err != nil {
		log.Printf("Failed to open database: %v", err)
		panic(err)
	}

	// Test the connection
	err = Db.Ping()
	if err != nil {
		log.Printf("Failed to ping database: %v", err)
		panic(err)
	}

	// Create users table
	cmdU := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid STRING NOT NULL UNIQUE,
		name STRING,
		email STRING,
		password STRING,
		created_at DATETIME)`, tableNameUser)
	_, err = Db.Exec(cmdU)
	if err != nil {
		log.Printf("Failed to create users table: %v", err)
	}

	// Create todos table with new fields
	cmdT := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		content TEXT,
		user_id INTEGER,
		priority TEXT DEFAULT 'medium',
		status TEXT DEFAULT 'todo',
		due_date DATE DEFAULT (date('now')),
		created_at DATETIME)`, tableNameTodo)
	_, err = Db.Exec(cmdT)
	if err != nil {
		log.Printf("Failed to create todos table: %v", err)
	}

	// Create sessions table
	cmdS := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid STRING NOT NULL UNIQUE,
		email STRING,
		user_id INTEGER,
		created_at DATETIME)`, tableNameSession)
	_, err = Db.Exec(cmdS)
	if err != nil {
		log.Printf("Failed to create sessions table: %v", err)
	}

	// Migrate existing todos table (add columns if they don't exist)
	migrateDatabase()
}

// migrateDatabase adds missing columns to existing tables
func migrateDatabase() {
	// First check if todos table exists
	var tableName string
	err := Db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'").Scan(&tableName)
	if err != nil {
		log.Printf("Todos table does not exist yet, skipping migration")
		return
	}

	// Check if columns exist and add them if they don't
	rows, err := Db.Query(`PRAGMA table_info(todos)`)
	if err != nil {
		log.Printf("Failed to get table info: %v", err)
		return
	}
	defer rows.Close()

	columns := make(map[string]bool)
	for rows.Next() {
		var cid int
		var name, dtype string
		var notnull int
		var dfltValue sql.NullString
		var pk int
		err := rows.Scan(&cid, &name, &dtype, &notnull, &dfltValue, &pk)
		if err != nil {
			log.Printf("Failed to scan column info: %v", err)
			continue
		}
		columns[name] = true
	}

	// Add missing columns
	if !columns["priority"] {
		_, err = Db.Exec(`ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium'`)
		if err != nil {
			log.Printf("Failed to add priority column: %v", err)
		} else {
			log.Println("Added priority column to todos table")
		}
	}

	if !columns["status"] {
		_, err = Db.Exec(`ALTER TABLE todos ADD COLUMN status TEXT DEFAULT 'todo'`)
		if err != nil {
			log.Printf("Failed to add status column: %v", err)
		} else {
			log.Println("Added status column to todos table")
		}
	}

	if !columns["due_date"] {
		_, err = Db.Exec(`ALTER TABLE todos ADD COLUMN due_date DATE DEFAULT (date('now'))`)
		if err != nil {
			log.Printf("Failed to add due_date column: %v", err)
		} else {
			log.Println("Added due_date column to todos table")
		}
	}

	// Update NULL values to defaults
	_, _ = Db.Exec(`UPDATE todos SET priority = 'medium' WHERE priority IS NULL`)
	_, _ = Db.Exec(`UPDATE todos SET status = 'todo' WHERE status IS NULL`)
	_, _ = Db.Exec(`UPDATE todos SET due_date = date('now') WHERE due_date IS NULL`)
}

func createUUID() (uuidobj uuid.UUID) {
	uuidobj, _ = uuid.NewUUID()
	return uuidobj
}

func Encrypt(plainText string) (crypted string) {
	crypted = fmt.Sprintf("%x", sha1.Sum([]byte(plainText)))
	return crypted
}
