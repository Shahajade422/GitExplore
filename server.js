const axios = require("axios");
const express = require("express");
const ejs = require("ejs");
const dirname = require("path");
const bodyParser = require("body-parser");

require("dotenv").config();
const app = express();
const PORT = 5500;

app.use(express.json());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
const token = process.env.TOKEN;

app.get("/", (req, res) => {
  res.render("handle");
});

app.get("/userdata/:username/:page/:num", async (req, res) => {
  const username = req.params.username;
  const page = req.params.page;
  const num = req.params.num;

  try {
    const userResponse = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userData = userResponse.data;

    const userReposResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userRepos = userReposResponse.data;

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

    const repoInfo = await Promise.all(repoInfoPromises);

    res.render("index", { repoInfo, userData, page, num });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("errorpage");
  }
});

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});

module.exports = app;
