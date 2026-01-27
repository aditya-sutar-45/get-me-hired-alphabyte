# Go Backend Setup Guide

This repository contains the Go backend for the project.
Follow the steps below to set up and run it locally.

---

## Prerequisites

Make sure you have the following installed:

- Go **1.20+**
- Git

Check Go version:

```bash
go version
```

## Get Started

### Clone the Repository

```bash
git clone github.com/aditya-sutar-45/get-me-hired-alphabyte
cd get-me-hired-alphabyte/backend
```

### Setup environment variables

At the root of the backend create a .env file and:

```env
PORT=3000
DB_URL=YOUR_POSTGRESQL_URL
LOCAL_STORE_PATH=path/to/your/local/store
```

### To run the backend

```bash
go run main.go
```

### Build and run

```bash
go build && ./backend
```
