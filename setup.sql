DROP TABLE IF EXISTS Follows;
DROP TABLE IF EXISTS Upd8;
DROP TABLE IF EXISTS Person;

CREATE TABLE Person(
    id INTEGER PRIMARY KEY,
    uname TEXT NOT NULL UNIQUE,
    pword TEXT NOT NULL,
    dname TEXT NOT NULL,
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



INSERT INTO Person VALUES (null, 'liamw', 'sha1$0ad7f9a3$1$96a27d0ecfab2c64913a3e6b8b60d9c6e4ee97e2', 'Liam', 'liam@email.com');
INSERT INTO Person VALUES (null, 'jackw', 'sha1$7f85da2c$1$325693e85f749a9009263ddccdea88235dd8a919', 'Jack', 'jack@email.com');
INSERT INTO Person VALUES (null, 'ianh', 'sha1$66bf5894$1$992b5366848df3807e6f68d5da8a89b238e90344', 'Ian', 'ian@email.com');
INSERT INTO Person VALUES (null, 'supercool123', 'sha1$ae32a91b$1$b1c1f17feafc7ab3b15669c176af67d9cf5a9b9c', 'Super Cool', 'sc123@email.com');
INSERT INTO Person VALUES (null, 'compsci', 'sha1$710e8a4b$1$7d61ef9d4ddf4b7883cc48a582004c77d17fa661', 'Computer Science', 'compsci@email.com');

INSERT INTO Upd8 VALUES (null, 1, 'message 1', 'url 1', 1463751854892);
INSERT INTO Upd8 VALUES (null, 1, 'message 2', 'url 2', 1463752903202);
