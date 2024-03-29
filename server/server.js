const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./Schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};

startApolloServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const _dirname = path.dirname("");
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public/index.html"));
  });
}

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});