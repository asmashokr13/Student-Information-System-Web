CREATE DATABASE UniversityAuthDB;
GO

USE UniversityAuthDB;
GO

CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Password NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL
);

INSERT INTO Users (Name, Email, Password, Role)
VALUES
('Admin User', 'admin@test.com', '1234', 'admin'),
('Student User', 'student@test.com', '1234', 'student');
