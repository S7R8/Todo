package models

import (
	"log"
	"time"
)

type User struct {
	ID        int       `json:"id"`
	UUID      string    `json:"uuid"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	Todos     []Todo    `json:"todos"`
}

type Session struct {
	ID        int       `json:"id"`
	UUID      string    `json:"uuid"`
	Email     string    `json:"email"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) CreateUser() (err error) {
	cmd := `INSERT INTO users (
		uuid,
		name,
		email,
		password,
		created_at
	) VALUES (?, ?, ?, ?, ?)`
	_, err = Db.Exec(cmd,
		createUUID(),
		u.Name,
		u.Email,
		Encrypt(u.Password),
		time.Now())
	if err != nil {
		log.Println("CreateUser error:", err)
	}
	return err
}

func GetUser(id int) (user User, err error) {
	user = User{}
	cmd := `SELECT
		id,
		uuid,
		name,
		email,
		password,
		created_at
	FROM users WHERE id = ?`
	err = Db.QueryRow(cmd, id).Scan(
		&user.ID,
		&user.UUID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		log.Println("GetUser error:", err)
	}
	return user, err
}

func (u *User) UpdateUser() (err error) {
	cmd := `Update users set name = ?, email = ? where id = ?`
	_, err = Db.Exec(cmd, u.Name, u.Email, u.ID)
	if err != nil {
		log.Println("UpdateUser error:", err)
	}
	return err
}

func (u *User) DeleteUser() (err error) {
	cmd := `Delete from users where id = ?`
	_, err = Db.Exec(cmd, u.ID)
	if err != nil {
		log.Println("DeleteUser error:", err)
	}
	return err
}

func GetUserByEmail(email string) (user User, err error) {
	user = User{}
	cmd := `SELECT
		id,
		uuid,
		name,
		email,
		password,
		created_at
	FROM users WHERE email = ?`
	err = Db.QueryRow(cmd, email).Scan(
		&user.ID,
		&user.UUID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		return user, err
	}
	return user, err
}

func (u *User) CreateSession() (s Session, err error) {
	session := Session{}
	cmd1 := `INSERT INTO sessions (
		uuid,
		email,
		user_id,
		created_at) VALUES (?, ?, ?, ?)`
	_, err = Db.Exec(cmd1, createUUID(), u.Email, u.ID, time.Now())
	if err != nil {
		log.Println(err)
	}
	cmd2 := `SELECT id, uuid, email, user_id, created_at FROM sessions WHERE user_id = ? and email = ?`
	err = Db.QueryRow(cmd2, u.ID, u.Email).Scan(
		&session.ID,
		&session.UUID,
		&session.Email,
		&session.UserID,
		&session.CreatedAt,
	)
	return session, err
}

func (s *Session) CheckSession() (valid bool, err error) {
	cmd := `SELECT id, uuid, email, user_id, created_at
	FROM sessions WHERE uuid = ?`
	err = Db.QueryRow(cmd, s.UUID).Scan(
		&s.ID,
		&s.UUID,
		&s.Email,
		&s.UserID,
		&s.CreatedAt,
	)
	if err != nil {
		valid = false
		return valid, err
	}
	if s.ID != 0 {
		valid = true
	}
	return valid, err
}

func (s *Session) DeleteSessionByUUID() (err error) {
	cmd := `DELETE FROM sessions WHERE uuid = ?`
	_, err = Db.Exec(cmd, s.UUID)
	if err != nil {
		log.Println("DeleteSessionByUUID error:", err)
	}
	return err
}

func (s *Session) GetUserBySession() (user User, err error) {
	user = User{}
	cmd := `SELECT
		id,
		uuid,
		name,
		email,
		password,
		created_at
	FROM users WHERE id = ?`
	err = Db.QueryRow(cmd, s.UserID).Scan(
		&user.ID,
		&user.UUID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		log.Println("GetUserBySession error:", err)
	}
	return user, err
}
