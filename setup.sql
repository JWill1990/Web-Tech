DROP TABLE IF EXISTS Follows;
DROP TABLE IF EXISTS Upd8;
DROP TABLE IF EXISTS Person;

CREATE TABLE Person(
    id INTEGER PRIMARY KEY,
    uname TEXT NOT NULL UNIQUE,
    pword TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE Upd8(
    id INTEGER PRIMARY KEY,
    poster INTEGER REFERENCES Person(id),
    message TEXT NOT NULL,
    url TEXT,
    postedAt INTEGER NOT NULL
);

CREATE TABLE Follows(
    follower INTEGER REFERENCES Person(id),
    followee INTEGER REFERENCES Person(id)
);

INSERT INTO Person VALUES (null, 'liamw', 'pass1', 'Liam', 'liam@email.com');
INSERT INTO Person VALUES (null, 'jackw', 'pass2', 'Jack', 'jack@email.com');
INSERT INTO Person VALUES (null, 'ianh', 'pass3', 'Ian', 'ian@email.com');
INSERT INTO Person VALUES (null, 'supercool123', 'pass4', 'Super Cool', 'sc123@email.com');
INSERT INTO Person VALUES (null, 'compsci', 'pass5', 'Computer Science', 'compsci@email.com');
