const _ = require("lodash");

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1;
};

const favoriteBlogByLikes  = (blogs) => {
  return _.maxBy(blogs, "likes");
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, current) => sum += current.likes, 0);
};

const mostBlogsByAuthor = (blogs) => {
  const groupedByAuthor = _.groupBy(blogs, "author");
  const authorsWithBlogCount = _.map(groupedByAuthor, (posts, author) => ({
    author,
    blogCount: posts.length,
  }));
  const topAuthor = _.maxBy(authorsWithBlogCount, "blogCount");
  return topAuthor || { author: null, blogCount: 0 };
};

const authorWithMostLikes = (blogs) => {
  const likesByAuthor = _.groupBy(blogs, "author");
  const likesSummary = _.mapValues(likesByAuthor, (blogs) => {
    return _.sumBy(blogs, "likes");
  });
  const maxLikesAuthor = _.maxBy(_.keys(likesSummary), (author) => likesSummary[author]);
  return {
    author: maxLikesAuthor,
    likes: likesSummary[maxLikesAuthor],
  };
};

module.exports = {
  dummy, totalLikes, favoriteBlogByLikes, mostBlogsByAuthor, authorWithMostLikes,
};
