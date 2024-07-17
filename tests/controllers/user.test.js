const { test, after, before, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const helper = require("./user.test_helper");
const argon2 = require("argon2");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const { username, name, password } = helper.getSingleUser();

    const passwordHash = await argon2.hash(password);
    const user = new User({ username, name, passwordHash });

    await user.save();
  });

  test("creation succeeds with a unique username", async () => {
    const usersAtStart = await helper.getAllDbData();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.getAllDbData();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    assert(usernames.includes(newUser.username), "The post api call failed the save the db data");
    assert(usernames.includes(helper.getSingleUser().username), "The default added user for the test is not present in db");
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.getAllDbData();

    const { username, name, password } = helper.getSingleUser();

    const newUser = {
      username,
      name,
      password,
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.getAllDbData();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with proper statuscode and message if username is too short", async () => {
    const usersAtStart = await helper.getAllDbData();

    // eslint-disable-next-line no-unused-vars
    const { username, name, password } = helper.getSingleUser();

    const newUser = {
      "username": "bob",
      name,
      password,
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.getAllDbData();
    assert(result.body.error.includes("is shorter than the minimum allowed length (4)"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
