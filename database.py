import mysql.connector
from mysql.connector import Error

def create_connection(host_name, user_name, user_password):
    """Establish a connection to the MySQL server."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def create_database(connection, query):
    """Create a database in MySQL."""
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        print("Database created successfully")
    except Error as e:
        print(f"The error '{e}' occurred")

def execute_query(connection, query):
    """Execute a single query to create tables."""
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        print("Query executed successfully")
    except Error as e:
        print(f"The error '{e}' occurred")

# Establish a connection to the server
connection = create_connection("127.0.0.1", "root", "test")
print('hi')

# Create the database
create_database_query = "CREATE DATABASE IF NOT EXISTS QuizApp"
create_database(connection, create_database_query)

# Connect to the new database
connection.database = "QuizApp"

# Define the SQL queries for table creation
create_employer_table = """
CREATE TABLE IF NOT EXISTS Employer (
    EmployerID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    PasswordHash VARCHAR(255),
    ProfileInfo TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

create_candidate_table = """
CREATE TABLE IF NOT EXISTS Candidate (
    CandidateID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100),
    ProfileInfo TEXT
);
"""

create_quiz_table = """
CREATE TABLE IF NOT EXISTS Quiz (
    QuizID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100),
    Description TEXT,
    CreatedBy INT,
    TimeLimit INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Employer(EmployerID)
);
"""

create_question_table = """
CREATE TABLE IF NOT EXISTS Question (
    QuestionID INT PRIMARY KEY AUTO_INCREMENT,
    QuizID INT,
    QuestionText TEXT,
    QuestionType ENUM('True/False', 'Multiple Choice', 'Checkbox', 'Free-form'),
    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID)
);
"""

create_answer_option_table = """
CREATE TABLE IF NOT EXISTS AnswerOption (
    OptionID INT PRIMARY KEY AUTO_INCREMENT,
    QuestionID INT,
    OptionText TEXT,
    FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID)
);
"""

create_quiz_link_table = """
CREATE TABLE IF NOT EXISTS QuizLink (
    QuizLinkID INT PRIMARY KEY AUTO_INCREMENT,
    UniqueKey VARCHAR(255) UNIQUE,
    QuizID INT,
    CandidateID INT,
    LinkCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LinkExpiresAt TIMESTAMP,
    IsLinkUsed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID),
    FOREIGN KEY (CandidateID) REFERENCES Candidate(CandidateID)
);
"""

create_quiz_response_table = """
CREATE TABLE IF NOT EXISTS QuizResponse (
    ResponseID INT PRIMARY KEY AUTO_INCREMENT,
    QuizLinkID INT,
    QuestionID INT,
    ResponseText TEXT,
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (QuizLinkID) REFERENCES QuizLink(QuizLinkID),
    FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID)
);
"""

create_quiz_result_table = """
CREATE TABLE IF NOT EXISTS QuizResult (
    ResultID INT PRIMARY KEY AUTO_INCREMENT,
    QuizLinkID INT,
    TotalScore DECIMAL(5, 2),
    TimeTaken INT,
    CompletedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (QuizLinkID) REFERENCES QuizLink(QuizLinkID)
);
"""

# Execute the queries to create the tables
execute_query(connection, create_employer_table)
execute_query(connection, create_candidate_table)
execute_query(connection, create_quiz_table)
execute_query(connection, create_question_table)
execute_query(connection, create_answer_option_table)
execute_query(connection, create_quiz_link_table)
execute_query(connection, create_quiz_response_table)
execute_query(connection, create_quiz_result_table)
