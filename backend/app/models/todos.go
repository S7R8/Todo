package models

import (
	"log"
	"time"
)

type Todo struct {
	ID        int
	Content   string
	UserID    int
	Priority  string    // "high", "medium", "low"
	Status    string    // "todo", "completed"
	DueDate   string    // Date as string (YYYY-MM-DD)
	CreatedAt time.Time
}

func (t *User) CreateTodo(content string, priority string, dueDate string) (err error) {
	if priority == "" {
		priority = "medium"
	}
	if dueDate == "" {
		dueDate = time.Now().Format("2006-01-02")
	}

	cmd := `INSERT INTO todos (
		content,
		user_id,
		priority,
		status,
		due_date,
		created_at
	) VALUES (?, ?, ?, ?, ?, ?)`
	_, err = Db.Exec(cmd,
		content,
		t.ID,
		priority,
		"todo",
		dueDate,
		time.Now())
	if err != nil {
		log.Println("CreateTodo error:", err)
	}
	return err
}

func GetTodo(id int) (todo Todo, err error) {
	cmd := `SELECT id, content, user_id, 
		COALESCE(priority, 'medium') as priority,
		COALESCE(status, 'todo') as status,
		COALESCE(due_date, date('now')) as due_date,
		created_at FROM todos
	WHERE id = ?`

	todo = Todo{}
	err = Db.QueryRow(cmd, id).Scan(
		&todo.ID,
		&todo.Content,
		&todo.UserID,
		&todo.Priority,
		&todo.Status,
		&todo.DueDate,
		&todo.CreatedAt,
	)
	if err != nil {
		log.Println("GetTodo error:", err)
	}
	return todo, err
}

func (u *User) GetTodosByUser() (todos []Todo, err error) {
	cmd := `SELECT id, content, user_id, 
		COALESCE(priority, 'medium') as priority,
		COALESCE(status, 'todo') as status,
		COALESCE(due_date, date('now')) as due_date,
		created_at FROM todos
	WHERE user_id = ?`
	rows, err := Db.Query(cmd, u.ID)
	if err != nil {
		log.Println("GetTodosByUser error:", err)
		return todos, err
	}
	defer rows.Close()
	
	for rows.Next() {
		var todo Todo
		err = rows.Scan(
			&todo.ID,
			&todo.Content,
			&todo.UserID,
			&todo.Priority,
			&todo.Status,
			&todo.DueDate,
			&todo.CreatedAt,
		)
		if err != nil {
			log.Println("Scan error:", err)
			continue
		}
		todos = append(todos, todo)
	}
	return todos, err
}

func (t *Todo) UpdateTodo() error {
	cmd := `UPDATE todos SET content = ?, user_id = ?, priority = ?, status = ?, due_date = ? WHERE id = ?`
	_, err := Db.Exec(cmd, t.Content, t.UserID, t.Priority, t.Status, t.DueDate, t.ID)
	if err != nil {
		log.Println("UpdateTodo error:", err)
	}
	return err
}

func (t *Todo) DeleteTodo() error {
	cmd := `DELETE FROM todos WHERE id = ?`
	_, err := Db.Exec(cmd, t.ID)
	if err != nil {
		log.Println("DeleteTodo error:", err)
	}
	return err
}
