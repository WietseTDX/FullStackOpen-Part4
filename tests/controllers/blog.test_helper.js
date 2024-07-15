const Blog = require("../../models/blog");

const multipleBlogs = [
  {
    "title": "First blog",
    "author": "Your developer",
    "url": "http://localhost:3001",
    "likes": 1,
  },
  {
    "title": "Second blog",
    "author": "Your developer",
    "url": "http://localhost:3001",
    "likes": 2,
  },
];

const getMultipleBlogs = () => {
  return [...multipleBlogs];
};

const singleBlog = {
  "title": "First blog",
  "author": "Your developer",
  "url": "http://localhost:3001",
  "likes": 1,
};

const getSingleBlog = () => {
  return JSON.parse(JSON.stringify(singleBlog));
};

const getAllDbData = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const addBlogToDb = async (body) => {
  const blog = new Blog(body);
  return (await blog.save()).toJSON();
};

module.exports = {
  getAllDbData, getMultipleBlogs, getSingleBlog, addBlogToDb,
};
