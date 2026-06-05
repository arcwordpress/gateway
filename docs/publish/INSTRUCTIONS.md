Place only in existing folders choosing from user-guide/dev-docs/ref-docs/api-docs. These folders represents the 4 doc sets we have and all docs must be children of one of these.

First part of the name is the doc group, and the group name should be suffixed (or divided) from the filename by double hyphens. Determine the group name based on the existing group names available or create a new one if required based on the topic.

Always try to use existing group names if this is suitable. For instance if getting-started--installation.md exists and the topic is suitable for getting-started choose this as the group. Otherwise choose to make a new group name. 

Use only lowercase and hyphens in file names. 

Store only .md anything else belongs somewhere else. Examples that are files might be put under /docs/examples for instance. Never pollute the /docs/publish with anything other than MD format files.

Every file must start with a title on its own line and have an empty line under it before the rest of the content. This enables us to parse out the title when needed in certain displays where title is stored separately.

Example suitable naming: user-guide/getting-started--installation.md

