"use strict";

const alfy = require("alfy");
const { getPathItem } = require("./lib/pathItemCreator.js");
const { getProjects } = require("./lib/sfdxDataLoader.js");

const searchTerm = alfy.input;

const projects = await getProjects();
const pathItem = getPathItem(["Projects"]);
const addProjectItem = getAddProjectItem();
const projectPathItems = alfy.matches(
  searchTerm,
  getProjectItems(projects),
  "title"
);
alfy.output([pathItem, addProjectItem, ...projectPathItems]);

function getAddProjectItem() {
  return {
    title: "Add Project",
    icon: { path: "./icn/plus-circle.icns" },
    arg: "",
    variables: {
      action: "sfdx:project:add:choosefolder",
    },
    mods: {
      ctrl: {
        subtitle: "",
      },
      alt: {
        subtitle: "",
      },
    },
  };
}

function getProjectItems(projects) {
  return projects
    .map((project) => ({
      title: project.dir,
      subtitle: `...${project.path}`,
      icon: { path: "./icn/folder.icns" },
      arg: "",
      variables: {
        action: "sfdx:project:details",
        projectPath: project.path,
      },
      path: project.path,
      mods: {
        ctrl: {
          subtitle: `OPEN "...${project.path}/sfdx-project.json"`,
          icon: { path: "./icn/eye.icns" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: `${project.path}/sfdx-project.json`,
          },
        },
        alt: {
          subtitle: `OPEN "...${project.path}"`,
          icon: { path: "./icn/eye.icns" },
          variables: {
            action: "sfdx:open:file",
            pathToOpen: project.path,
          },
        },
      },
    }))
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}
