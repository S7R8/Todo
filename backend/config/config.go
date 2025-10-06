package config

import (
	"log"

	"todo_app/utils"

	"gopkg.in/go-ini/ini.v1"
)

type ConfigList struct {
	Port      string
	SQLDriver string
	DbName    string
	LogFile   string
}

var Config ConfigList

func init() {
	LoadConfig()
	utils.LoggingSettings(Config.LogFile)
}

func LoadConfig() {
	log.Println("Loading config.ini...")
	cfg, err := ini.Load("config.ini")
	if err != nil {
		log.Fatalf("Failed to load config.ini: %v", err)
	}
	Config = ConfigList{
		Port:      cfg.Section("web").Key("port").String(),
		SQLDriver: cfg.Section("db").Key("driver").String(),
		DbName:    cfg.Section("db").Key("name").String(),
		LogFile:   cfg.Section("web").Key("logfile").String(),
	}
	log.Printf("Config loaded - Port: %s, DB: %s", Config.Port, Config.DbName)
}
