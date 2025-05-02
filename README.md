# <img src="./frontend/public/favicon.png" height="22pt"> CoCrafter Code Challenge v2

This project is a backend mini app built with Node.js (NitroJS) that integrates with a mock S3 storage service. It was developed as part of a coding challenge.

## Time Spent

Approximately **half a day**.

## How I Approached the Problem

- Started by reading the challenge description multiple times to clearly understand the requirements.
- Sketched a tree structure using real IDs and names to visualize the data.
- Noticed the backend relied on AWS S3, so I reviewed the relevant documentation to understand how to work with it.
- Built API endpoints based on prior experience with NoSQL databases (e.g., Google Firebase).

##  Technical Decisions

- The legacy code suggested a Python backend, but I chose **Node.js with NitroJS** for flexibility and familiarity.
- Ran the mock S3 service in a Docker container.
- Started the backend separately with hot reload enabled for faster development.
- Used **Postman** to test all API endpoints during development.

## Most Difficult Part

The biggest challenge was handling **CORS** when connecting the frontend to the backend. NitroJS didn’t have a plug-and-play solution, so I spent a few hours debugging and eventually solved it by implementing a **custom middleware** to handle `CORS preflight` request.

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