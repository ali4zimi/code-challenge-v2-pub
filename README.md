# <img src="./frontend/public/favicon.png" height="22pt"> CoCrafter Code Challenge v2

This project includes a backend which was asked in the challenge description. The backend is designed in `nitrojs`.

Thank you for putting together this interesting and amazing challenge. I quite enjoyed it. 😊

## Time Spent

For writing the code logic it took me approximately **half a day**. However, I have been reading about the `s3mock` during the week while I was traveling. Also, it was my first time working with that, but it was fun.

## How I Approached the Problem

- Started by reading the challenge description multiple times to clearly understand the requirements.
- Sketched a tree structure using real IDs and names to visualize the data.
- Noticed the backend relied on AWS S3, so I reviewed the relevant documentation to understand how to work with it.
- Built API endpoints based on prior experience with NoSQL databases (e.g., Google Firebase).

##  Technical Decisions

- Choosing a backend framework was a bit challenging. Based on the legacy-backend folder, it seemed the original backend might have been written in Python. However, I chose to implement it in Node.js using NitroJS, which I’m familiar with.
- I ran the mock S3 container separately and kept the backend running on its own with hot reload enabled for a smoother development workflow.
- Used **Postman** to test all API endpoints during development.

## Most Difficult Part

The biggest challenge was handling **CORS** when connecting the frontend to the backend. So, I spent a few hours debugging and eventually solved it by implementing a **custom middleware** to handle `CORS preflight` request.

## If This Were a Production Feature

If this was intended for production use, I would:

- Add input validation and improved error handling.
- Write unit and integration tests.
- Set up a more complete Docker environment to ensure everything works with a single `docker-compose up`.

##  How to Run

1. Clone the repo.
2. Run the following in the root directory:

   ```bash
   docker-compose up
   ```

Note: You need docker to run this project