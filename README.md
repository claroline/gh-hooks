Usage
-----

```
npm install
npm start
```

Parameters
----------

General parameters are stored in the *.env* file (a *.env.dist* template is
provided). Git credentials (for pushes) are stored in *~/.git-credentials* 
using the git helper:

```
git config --global credential.helper store
```
