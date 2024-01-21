const axios = require("axios");
const express = require("express");
const ejs = require("ejs");
const dirname = require("path");
const bodyParser = require("body-parser");

require("dotenv").config();
const app = express();
const PORT = 5500;

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// Fetch user's repositories
const token = process.env.TOKEN;

// Fetch user's repositories

// // Fetch user's profile

app.get("/", (req, res) => {
  res.render("handle");
});

app.get("/userdata/:username/:page/:num", async (req, res) => {
  const username = req.params.username;
  const page = req.params.page;
  const num = req.params.num;

  try {
    // Fetch user data
    const userResponse = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userData = userResponse.data;

    // Fetch user repositories
    const userReposResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userRepos = userReposResponse.data;

    // Fetch languages for each repository
    const repoInfoPromises = userRepos.map(async (repo) => {
      const repoLanguagesResponse = await axios.get(
        `https://api.github.com/repos/${username}/${repo.name}/languages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const repoLanguages = repoLanguagesResponse.data;

      return {
        name: repo.name,
        description: repo.description,
        languages: repoLanguages,
      };
    });

    // Wait for all promises to resolve
    const repoInfo = await Promise.all(repoInfoPromises);

    // Render the EJS template with the data
    res.render("index", { repoInfo, userData, page, num });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("errorpage");
  }
});

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
