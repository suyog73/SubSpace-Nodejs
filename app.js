const express = require("express");
const app = express();
const lodash = require("lodash");
const axios = require("axios");

const memoize = require("lodash/memoize");

const getBlogStats = memoize(async () => {
  try {
    const response = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    const blogData = response.data;

    const totalBlogs = blogData.blogs.length;
    const longestTitleBlog = lodash.maxBy(
      blogData.blogs,
      (blog) => blog.title.length
    );
    const privacyBlogs = lodash.filter(blogData.blogs, (blog) =>
      lodash.toLower(blog.title).includes("privacy")
    );
    const uniqueBlogTitles = lodash
      .uniqBy(blogData.blogs, (blog) => lodash.toLower(blog.title))
      .map((blog) => blog.title);

    const analysisResults = {
      totalBlogs,
      longestTitle: longestTitleBlog.title,
      privacyBlogs: privacyBlogs.length,
      uniqueBlogTitles,
    };

    return analysisResults;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
});

const searchBlogs = memoize(async (query) => {
  try {
    const apiUrl = `https://intent-kit-16.hasura.app/api/rest/blogs`;

    const response = await axios.get(apiUrl, {
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    });

    const blogData = response.data;

    const searchResults = lodash.filter(blogData.blogs, (blog) =>
      lodash.toLower(blog.title).includes(query)
    );

    return searchResults;
  } catch (error) {
    console.error("Error during blog search:", error);
    throw error;
  }
});

app.get("/api/blog-stats", async (req, res) => {
  try {
    const analysisResults = await getBlogStats();

    res.status(200).json(analysisResults);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

app.get("/api/blog-search", async (req, res) => {
  try {
    const query = lodash.toLower(req.query.query);

    const searchResults = await searchBlogs(query);

    res.status(200).json(searchResults);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during the blog search." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
