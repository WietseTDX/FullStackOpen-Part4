const { test, after, before, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../app");
const Blog = require("../../models/blog");
const helper = require("./blog.test_helper");

const api = supertest(app);

describe("GET request from database, content type json", () => {

  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.getMultipleBlogs());
  });

  test("blogs are returned as json", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const expectedKeys = ["id", "author", "url", "likes", "title"];
    const responsekeys = Object.keys(response._body[0]);
    assert.deepStrictEqual(
      expectedKeys.every(value => responsekeys.includes(value)) &&
      responsekeys.every(value => expectedKeys.includes(value)), true);
  });
});

describe("A full blog post to API", () => {
  let TOKEN = null;
  // eslint-disable-next-line no-unused-vars
  let USERID = null;
  before(async () => {
    await Blog.deleteMany({});
    await helper.deleteTestUser();
    [TOKEN, USERID] = await helper.addTestUserGetToken();
  });

  const payload = helper.getSingleBlog();

  test("POST blog as json to database with token", async () => {
    const response = await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${TOKEN}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const responseBody = response._body;

    const DbData = (await helper.getAllDbData())[0];  // get first element as there should only be one
    DbData.user = DbData.user.toString();   // change user id to string for comparison

    assert.deepStrictEqual(responseBody, DbData, "Data in Db does not match the response");

    assert.deepStrictEqual(Object.keys(responseBody).includes("id"), true, "Missing id key");
    assert.deepStrictEqual(Object.keys(responseBody).includes("user"), true, "Missing user key");
    delete responseBody.id;   // remove id variable to match inital payload
    delete responseBody.user; // remove user variable to match inital payload
    assert.deepStrictEqual(responseBody, payload, "Response body does not match with payload");

  });

  test("POST blog as json to database without token", async () => {
    const response = await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(401)
      .expect("Content-Type", /application\/json/);
    assert.strictEqual(JSON.parse(response.text).error, "token invalid");
  });
});

describe("Verify likes property default to 0 when not provided", () => {
  let TOKEN = null;
  // eslint-disable-next-line no-unused-vars
  let USERID = null;
  before(async () => {
    await Blog.deleteMany({});
    await helper.deleteTestUser();
    [TOKEN, USERID] = await helper.addTestUserGetToken();
  });

  const payload = helper.getSingleBlog();
  delete payload.likes;

  test("POST blog without likes property to default to 0", async () => {
    const response = await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${TOKEN}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const responseBody = response._body;
    assert.deepStrictEqual(Object.keys(responseBody).includes("likes"), true);
    assert.deepStrictEqual(responseBody.likes, 0);
  });

  test("Verify POST request in database without likes and it defaulted to 0", async () => {
    const arrayResponseBody = await helper.getAllDbData();
    assert(arrayResponseBody.length > 0);
    const responseBody = arrayResponseBody[0];

    assert.deepStrictEqual(Object.keys(responseBody).includes("likes"), true);
    assert.deepStrictEqual(responseBody.likes, 0);
  });
});

describe("POST new blogs without required fields, verify code 400 and no data added", () => {
  let TOKEN = null;
  // eslint-disable-next-line no-unused-vars
  let USERID = null;
  before(async () => {
    await helper.deleteTestUser();
    [TOKEN, USERID] = await helper.addTestUserGetToken();
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  const postBlogcode400 = async (payload) => {
    await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${TOKEN}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await helper.getAllDbData();

    assert.deepStrictEqual(blogsAfter.length, 0);
  };


  test("fails with status code 400, POST request if title fied is empty", async () => {

    const payload = helper.getSingleBlog();
    delete payload.title;

    await postBlogcode400(payload);
  });

  test("fails with status code 400, POST request if author fied is empty", async () => {

    const payload = helper.getSingleBlog();
    delete payload.author;

    await postBlogcode400(payload);
  });

  test("fails with status code 400, POST request if url fied is empty", async () => {

    const payload = helper.getSingleBlog();
    delete payload.url;

    await postBlogcode400(payload);
  });
});

describe("DELETE blog by id and verify its removal", async () => {
  let TOKEN = null;
  let USERID = null;
  before(async () => {
    await helper.deleteTestUser();
    [TOKEN, USERID] = await helper.addTestUserGetToken();
  });

  let blogInDb = {};
  const payload = helper.getSingleBlog();
  beforeEach(async () => {
    await Blog.deleteMany({});
    blogInDb = await helper.addBlogToDb(payload, USERID);
    blogInDb.user = blogInDb.user.toString();     // change id object to string for future comparison
    assert(Object.keys(blogInDb).length > 0, "The database write has failed this describe will fail");
  });

  test("Delete a blog entry on id", async () => {
    await api
      .delete(`/api/blogs/${blogInDb.id}`)
      .set("Authorization", `Bearer ${TOKEN}`)
      .expect(204);

    assert.deepStrictEqual((await helper.getAllDbData()).length, 0, "The data was not correctly deleted, there are still records in the database");
  });

  test("Delete a non exsistent blog", async () => {
    // eslint-disable-next-line no-unused-vars
    const response = await api
      .delete(`/api/blogs/${blogInDb.id.slice(0, -8)}XXXXXXXX`)
      .set("Authorization", `Bearer ${TOKEN}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual((await helper.getAllDbData()).length, 1, "The data was deleted with a wrong id, there should be a record still in the database");
  });
});


describe("PUT change single blog information", async () => {
  let blogInDb = {};
  let payload = {};
  beforeEach(async () => {
    payload = helper.getSingleBlog();
    await Blog.deleteMany({});
    blogInDb = await helper.addBlogToDb(payload);
    assert(Object.keys(blogInDb).length > 0, "The database write has failed this describe will fail");
  });

  test("Change amount of likes", async () => {
    payload.likes = 5;
    const response = await api
      .put(`/api/blogs/${blogInDb.id}`)
      .send(payload)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body.likes, payload.likes);

    const blogsAfter = await helper.getAllDbData();
    assert.deepStrictEqual(blogsAfter.length, 1);
    assert.deepStrictEqual(blogsAfter[0].likes, payload.likes);
  });

  test("Change amount of likes with invalid id", async () => {
    // eslint-disable-next-line no-unused-vars
    const response = await api
      .put(`/api/blogs/${blogInDb.id.slice(0, -8)}XXXXXXXX`)
      .send(payload)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await helper.getAllDbData();
    assert.deepStrictEqual(blogsAfter.length, 1);
    assert.deepStrictEqual(blogsAfter[0].likes, payload.likes);
  });

});

after(async () => {
  await mongoose.connection.close();
});
