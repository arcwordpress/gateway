Name with Doc Set first choosing from user-guide/dev-docs/ref-docs/api-docs. 

Second part of the name is the group, and the group-name should be prefixed (or divided) from the doc set and the filename by double hyphens. Determine the group name based on the existing group names available or create a new one if required based on the topic.

Always try to use existing group names if this is suitable. 

Use only lowercase and hyphens in names. 

Store only .md anything else belongs somewhere else. Examples that are files might be put under /docs/examples for instance. Never pollute the /docs/publish with anything other than MD format files.

Preface title with "Title: " such as "Title: Getting Started" so that when we parse the MD file we can automatically strip the title because it is stored separately in our documentation system. Do not preface the remainder of the document, after title begin with text or heading.

Example suitable naming: user-guide--getting-started--installation.md

