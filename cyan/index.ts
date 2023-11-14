import {Cyan, GlobType, QuestionType, StartTemplateWithLambda} from "@atomicloud/cyan-sdk";
import validator from "validator";
import isInt = validator.isInt;
import isEmail = validator.isEmail;
import isURL = validator.isURL;

const referenceValid = (input: string) => {
  let fullRef = input;

  if (input.includes(":")) {
    if (input.split(":").length !== 2) {
      return "Invalid reference, can only have one colon";
    }
    const [fullref, version] = input.split(":");
    if (!isInt(version, { min: 0 })) {
      return "Invalid reference, version must be a positive integer";
    }
    fullRef = fullref;
  }

  const parts = fullRef.split("/");
  if (parts.length !== 2) {
    return "Invalid reference, must be in the format username/template or username/template:version";
  }
  const [username, template] = parts;
  const usernameError = usernameValidator("Reference username")(username);
  if (usernameError) return usernameError;
  const templateError = usernameValidator("Reference template")(template);
  if (templateError) return templateError;
  return null;
};

const usernameValidator = (type: string) => (input: string) => {
  if (input.length < 1 || input.length > 256) {
    return `${type} must be between 1 and 256 characters`;
  }
  if (!input.match(/^[a-z](\-?[a-z0-9]+)*$/)) {
    return `${type} can only contain alphanumeric characters and dashes, and cannot end or start with dashes or numbers`;
  }
  return null;
};


StartTemplateWithLambda(async (inquirer, d): Promise<Cyan> => {
  const username = await inquirer.text({
    message: "CyanPrint username",
    desc: "You can find it in your profile in https://cyanprint.dev",
    type: QuestionType.Text,
    validate: usernameValidator("Username"),
  });

  const name = await inquirer.text({
    message: "Template name",
    desc: "Unique name under your account",
    type: QuestionType.Text,
    validate: usernameValidator("Template"),
  });

  const description = await inquirer.text({
    message: `Template description`,
    desc: `Short description of your template`,
    type: QuestionType.Text,
  });

  const email = await inquirer.text({
    message: "Email",
    desc: "Your email",
    type: QuestionType.Text,
    validate: (e) => (isEmail(e) ? null : "Invalid email"),
  });

  const tags: string[] = [];
  let cont = (await inquirer.select("Add a tag?", ["yes", "no"])) === "yes";
  while (cont) {
    const tag = await inquirer.text({
      message: "Tag to add",
      type: QuestionType.Text,
      validate: usernameValidator("Tag"),
    });
    tags.push(tag);
    cont = (await inquirer.select("Add a tag?", ["yes", "no"])) === "yes";
  }

  const project = await inquirer.text({
    message: "Project URL",
    desc: "Valid URL to this project's site",
    type: QuestionType.Text,
    validate: (url) =>
        isURL(url, { require_protocol: true }) ? null : "Invalid URL",
  });

  const source = await inquirer.text({
    message: "Source URL",
    desc: "Valid URL to this project source code",
    type: QuestionType.Text,
    validate: (url) =>
        isURL(url, { require_protocol: true }) ? null : "Invalid URL",
  });

  return {
    processors: [
      {
        name: "cyan/default",
        files: [
          {
            type: GlobType.Template,
            exclude: [],
            glob: "cyan.yaml",
            root: "template"
          },
            {
                type: GlobType.Copy,
                exclude: ["cyan.yaml"],
                glob: "**/*",
                root: "template"
            }
        ],
        config: {
          vars: {
            username,
            name,
            desc: description,
            project,
            source,
            email,
            tags: JSON.stringify(tags),
          }
        },
      },
    ],
    plugins: [

    ],
  }
});
