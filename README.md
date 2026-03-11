# 📧 Just Mail – Email Management System

Just Mail is a **lightweight full-stack email management web application** that allows users to register, login, send emails, manage contacts, and organize messages such as Inbox, Sent, Drafts, and Trash.

The project demonstrates the implementation of a **complete web application using Node.js, Express.js, and SQLite3**.

---

# 🚀 Features

✔ User Registration
✔ Secure Login System
✔ Compose Email
✔ Inbox Management
✔ Sent Mail
✔ Draft Emails
✔ Trash Management
✔ Contact Management
✔ Email Status Tracking (Read / Unread)

---

# 🛠 Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite3

### Security

* bcrypt password hashing

---

# 📂 Project Folder Structure

```
just-mail-project
│
├── public
│   ├── index.html
│   ├── register.html
│   ├── inbox.html
│   ├── style.css
│   └── js
│       └── api.js
│
├── server.js
├── database.db
├── package.json
└── package-lock.json
```

---

# ⚙️ Installation Guide (For Beginners)

Follow these steps carefully to run the project.

---

# 1️⃣ Install Required Software

Before running the project, install the following software.

---

## Install Node.js

Download Node.js from:

[https://nodejs.org](https://nodejs.org)

After installation, verify it by opening **Command Prompt / Terminal** and typing:

```
node -v
```

You should see a version number.

---

## Install Visual Studio Code

Download and install VS Code from:

[https://code.visualstudio.com](https://code.visualstudio.com)

This will be used to open and run the project.

---

## Install Git

Download Git from:

[https://git-scm.com](https://git-scm.com)

Git is used to download the project from GitHub.

---

# 📥 Download the Project from GitHub

Open **Command Prompt / Terminal** and run:

```
git clone https://github.com/Ocean-heaven369/Just-Mail.git
```

After downloading, move into the project folder:

```
cd just-mail-project
```

---

# 🖥 Open the Project in VS Code

1. Open **Visual Studio Code**

2. Click

```
File → Open Folder
```

3. Select the **just-mail-project** folder.

The entire project will appear in the **left sidebar**.

---

# 📦 Install Project Dependencies

Inside VS Code open the **terminal**

Menu:

```
Terminal → New Terminal
```

Run the command:

```
npm install
```

This installs all required packages.

Installed packages include:

* Express (Server Framework)
* SQLite3 (Database)
* bcrypt (Password Encryption)
* cors
* body-parser

---

# 🗄 Database Setup (SQLite)

This project uses **SQLite3** as the database.

You **do NOT need to manually create tables.**

When the server starts, it automatically creates the following tables:

* users
* emails
* contacts

If the database does not exist, the system will automatically create:

```
database.db
```

inside the project folder.

---

# ▶️ Run the Server

Inside the VS Code terminal run:

```
node server.js
```

If everything works correctly, the output will be:

```
Using DB at: database.db
Server running on port 3000
```

---

# 🌐 Open the Application

Open your browser and go to:

```
http://localhost:3000
```

You will see the **Just Mail Login Page**.

From here you can:

* Register a new account
* Login
* Send emails
* View Inbox
* Manage contacts

---

# 💻 Important Terminal Commands

### Install dependencies

```
npm install
```

### Start the server

```
node server.js
```

### Stop the server

```
CTRL + C
```

---

# 🔐 Security Implementation

The system uses **bcrypt hashing** to protect user passwords.

Instead of storing plain text passwords, they are converted into **secure hashed values** like:

```
$2b$10$Awsffnkjelfk....
```

This ensures **better protection against data breaches**.

---

# 📸 Screenshots

You can add screenshots of the system here.

Example:

```
/screenshots/login.png
/screenshots/inbox.png
/screenshots/compose.png
```

---

# 🔮 Future Enhancements

Some improvements that can be added in future versions:

* Email attachments support
* Real-time notifications
* Advanced spam filtering
* Cloud database integration
* Mobile responsive design
* Two-factor authentication
* Email search functionality

---

# 📚 Learning Outcomes

This project helps understand:

* Full-stack web development
* REST API creation
* Database integration
* User authentication
* Password security
* Email management systems

---

# 📜 Conclusion

**Just Mail** is a simple yet effective email management application that demonstrates the implementation of a **complete full-stack web system** using Node.js, Express, and SQLite.

The system allows users to **securely send, receive, and manage emails while storing user data safely using encrypted passwords.**
