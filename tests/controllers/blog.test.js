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

describe("Blog can be posted to API", () => {
  before(async () => {
    await Blog.deleteMany({});
  });

  const payload = helper.getSingleBlog();

  test("POST blog as json to database", async () => {
    const response = await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const responseBody = response._body;
    assert.deepStrictEqual(Object.keys(responseBody).includes("id"), true);
    delete responseBody.id;   // remove id variable to match inital payload
    assert.deepStrictEqual(responseBody, payload);
  });

  test("Verify POST request data is present in database", async () => {
    const arrayResponseBody = await helper.getAllDbData();
    assert(arrayResponseBody.length > 0);
    const responseBody = arrayResponseBody[0];

    assert(Object.keys(responseBody).includes("id"));
    delete responseBody.id;   // remove id variable to match inital payload
    assert.deepStrictEqual(responseBody, payload);
  });
});

describe("Verify likes property default to 0 when not provided", () => {
  before(async () => {
    await Blog.deleteMany({});
  });

  const payload = helper.getSingleBlog();
  delete payload.likes;

  test("POST blog without likes property to default to 0", async () => {
    const response = await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
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
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  const postBlogcode400 = async (payload) => {
    await api
      .post("/api/blogs")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
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
  let blogInDb = {};
  const payload = helper.getSingleBlog();
  beforeEach(async () => {
    await Blog.deleteMany({});
    blogInDb = await helper.addBlogToDb(payload);
    assert(Object.keys(blogInDb).length > 0, "The database write has failed this describe will fail");
  });

  test("Delete a blog entry on id", async () => {
    const response = await api
      .delete(`/api/blogs/${blogInDb.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body, blogInDb, "The deleted data does not match with the written data to the database");
    assert.deepStrictEqual((await helper.getAllDbData()).length, 0, "The data was not correctly deleted, there are still records in the database");
  });

  test("Delete a non exsistent blog", async () => {
    // eslint-disable-next-line no-unused-vars
    const response = await api
      .delete(`/api/blogs/${blogInDb.id.slice(0, -8)}XXXXXXXX`)
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
