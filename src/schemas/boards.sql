CREATE TABLE IF NOT EXISTS boards (
	id TEXT NOT NULL PRIMARY KEY,
	owner TEXT NOT NULL,
	name TEXT NOT NULL,
	created DATETIME NOT NULL,
	modified DATETIME NOT NULL,
	FOREIGN KEY (owner) REFERENCES users (id) ON DELETE CASCADE
);
