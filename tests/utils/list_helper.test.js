const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

describe("Helpers based on likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
  ];

  const listWithMultipleBlogs = [
    {
      _id: "5a422aa71b57a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Buddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 10,
      __v: 0,
    },
    {
      _id: "5a422aa761b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Duddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a676234d17f2",
      title: "Go To Statement Considered Harmful",
      author: "Daddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 15,
      __v: 0,
    },
    {
      _id: "5a422aa71b57a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Buddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 10,
      __v: 0,
    },
  ];

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.deepStrictEqual(result, 5);
  });

  test("when list has multiple blogs, sum of the total likes", () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs);
    assert.deepStrictEqual(result, 40);
  });

  test("list of multiple blogs, find most popular author based on likes", () => {
    const result = listHelper.favoriteBlogByLikes(listWithMultipleBlogs);
    const expectedResult = {
      _id: "5a422aa71b54a676234d17f2",
      title: "Go To Statement Considered Harmful",
      author: "Daddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 15,
      __v: 0,
    };
    assert.deepStrictEqual(result, expectedResult);
  });

  test("list with multiple blogs, find author with most accumaluted likes", () => {
    const result = listHelper.authorWithMostLikes(listWithMultipleBlogs);
    const expectedResult = {
      "author": "Buddy",
      "likes": 20,
    };
    assert.deepStrictEqual(result, expectedResult);
  });
});


describe("Helpers based on Author", () => {
  const listWithMultipleBlogs = [
    {
      _id: "5a422aa71b57a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Buddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 10,
      __v: 0,
    },
    {
      _id: "5a422aa761b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Buddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a676234d17f2",
      title: "Go To Statement Considered Harmful",
      author: "Daddy",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 15,
      __v: 0,
    },
  ];

  test("when list with multiple blogs, find author with most blogs", () => {
    const result = listHelper.mostBlogsByAuthor(listWithMultipleBlogs);
    const expectedResult = {
      "author": "Buddy",
      "blogCount": 2,
    };
    assert.deepStrictEqual(result, expectedResult);
  });
});
