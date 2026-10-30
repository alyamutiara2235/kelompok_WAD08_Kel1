CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE reservation_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user'
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  room_id INT NOT NULL REFERENCES rooms(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  purpose TEXT,
  participants INT,
  document_url TEXT,
  status reservation_status NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

INSERT INTO rooms (name, capacity) VALUES
  ('Ruang A101', 40), ('Lab Komputer 1', 30), ('Aula Utama', 200);