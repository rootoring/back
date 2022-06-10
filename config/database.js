const db = require('./index.js');  

let query = `
  create TABLE category (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255)
  );

  create TABLE child_category (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    category_id UUID REFERENCES category (_id)
  );

  create TABLE post (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    description VARCHAR(255),
    html TEXT,
    data VARCHAR(255),
    imgUrl VARCHAR(255)  
  );

  create TABLE post_to_category (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES post,
    category_id UUID NOT NULL REFERENCES category,
    child_category_id UUID NOT NULL REFERENCES child_category,
    UNIQUE (post_id, category_id, child_category_id) 
  );

  create TABLE comment (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES post,
    name VARCHAR(255),
    content TEXT
  );

  create TABLE users (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email TEXT,
    password VARCHAR(400)
  );

  create TABLE token(
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT,
    user_id UUID NOT NULL REFERENCES users
  );

  create TABLE post_to_user(
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES post,
    user_id UUID NOT NULL REFERENCES users,
    UNIQUE (post_id, user_id) 
  );
`

db.query(query);