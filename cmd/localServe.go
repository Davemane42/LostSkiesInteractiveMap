package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("../."))
	
	http.Handle("/", fs)
	
	log.Println("Server starting at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}