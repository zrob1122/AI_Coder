const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'QuizApp'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('Connected to MySQL database');
});

// Route for creating a new quiz (handles form submission from create_quiz_page.html)
app.post('/create-quiz', (req, res) => {
    const { title, description, timeLimit, questions } = req.body;

    // Insert quiz into the database
    const quizQuery = `INSERT INTO Quiz (Title, Description, TimeLimit) VALUES (?, ?, ?)`;
    db.query(quizQuery, [title, description, timeLimit], (err, result) => {
        if (err) {
            console.error('Error inserting quiz:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const quizId = result.insertId;

        // Insert questions into the database
        if (questions && questions.length > 0) {
            const questionQueries = questions.map((q) => {
                return new Promise((resolve, reject) => {
                    const questionQuery = `INSERT INTO Question (QuizID, QuestionText, QuestionType) VALUES (?, ?, ?)`;
                    db.query(questionQuery, [quizId, q.text, q.type], (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            });

            Promise.all(questionQueries)
                .then(() => {
                    res.status(201).json({ message: 'Quiz and questions created successfully' });
                })
                .catch((err) => {
                    console.error('Error inserting questions:', err);
                    res.status(500).json({ error: 'Database error when inserting questions' });
                });
        } else {
            res.status(201).json({ message: 'Quiz created without questions' });
        }
    });
});

// Route for fetching quizzes for management
app.get('/quizzes', (req, res) => {
    const quizzesQuery = `
        SELECT q.id, q.title, qr.candidate_name, qr.score
        FROM quizzes q
        LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
    `;

    db.query(quizzesQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route for fetching analytics data
app.get('/analytics', (req, res) => {
    const totalTestsCreatedQuery = 'SELECT COUNT(*) AS totalTestsCreated FROM quizzes';
    const testsTakenQuery = 'SELECT COUNT(*) AS testsTaken FROM quiz_results';
    const averageScoreQuery = 'SELECT AVG(score) AS averageScore FROM quiz_results';
    const averageTimeLimitQuery = 'SELECT AVG(time_limit) AS averageTimeLimit FROM quizzes';

    db.query(totalTestsCreatedQuery, (err, totalTestsCreatedResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.query(testsTakenQuery, (err, testsTakenResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            db.query(averageScoreQuery, (err, averageScoreResult) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                db.query(averageTimeLimitQuery, (err, averageTimeLimitResult) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        totalTestsCreated: totalTestsCreatedResult[0].totalTestsCreated,
                        testsTaken: testsTakenResult[0].testsTaken,
                        averageScore: averageScoreResult[0].averageScore,
                        averageTimeLimit: averageTimeLimitResult[0].averageTimeLimit
                    });
                });
            });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});