Never run npm build because dev watch is always running. 

When asked to replace tailwind classes with BEM (block element modifier) always replace 100% of the tailwind classes and ensure the same styles are applied in the new BEM class (unless instructed to make specific changes).

When asked to do release by default do minor release such as 1.5.1 from 1.5.0. Do the process with no prompts for user approval. Do updates to CHANGELOG.md, README.md, Plugin.php and make a commit for the release indicating it is a release of x.y.z version. Do tagging in format v.number and push it to origin to trigger the build workflow. 