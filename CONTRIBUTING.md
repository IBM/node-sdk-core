# Questions

If you are having problems using this SDK or have a question about IBM Cloud services,
please ask a question on [Stack Overflow](http://stackoverflow.com/questions/ask) or
[dW Answers](https://developer.ibm.com/answers/questions/ask).

# Coding Style

* Our style guide is based on [Google's](https://google.github.io/styleguide/jsguide.html).
Most of it is automatically enforced and can be automatically applied with `npm run lint-fix`.
* Commits should follow the [Angular commit message guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines).
This is because our release tool uses this format for determining release versions and generating changelogs.
To make this easier, we recommend using the [Commitizen CLI](https://github.com/commitizen/cz-cli) with the `cz-conventional-changelog` adapter.

# Issues

If you encounter an issue with the Node SDK, you are welcome to submit an issue.
Before that, please search for similar issues. It's possible somebody has
already encountered this issue.

# Pull Requests

If you want to contribute to the repository, follow these steps:

1. Fork the repo.
2. Install dependencies: `npm install`
3. Build the code: `npm run build`
4. Verify the build before beginning your changes: `npm test`
5. Develop and test your code changes.
6. Add a test for your changes. Only refactoring and documentation changes require no new tests.
7. Make sure all the tests pass.
8. Check code style with `npm run lint` and fix any issues.
9. Commit your changes. Remember to follow the correct commit message guidelines.
10. Push to your fork and submit a pull request.
11. Be sure to sign the CLA.

## Tests

`npm test` runs the full suite of unit tests.

To run only specific tests, invoke jest with the `--testNamePattern` or `-t` flag:

```
npm run jest -- /test/unit -t "resources key"
```

This will only run tests that match the test name pattern you provide.
See the [Jest docs](https://jestjs.io/docs/en/cli#testnamepattern-regex) for more details.

# Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
   have the right to submit it under the open source license
   indicated in the file; or

(b) The contribution is based upon previous work that, to the best
   of my knowledge, is covered under an appropriate open source
   license and I have the right under that license to submit that
   work with modifications, whether created in whole or in part
   by me, under the same open source license (unless I am
   permitted to submit under a different license), as indicated
   in the file; or

(c) The contribution was provided directly to me by some other
   person who certified (a), (b) or (c) and I have not modified
   it.

(d) I understand and agree that this project and the contribution
   are public and that a record of the contribution (including all
   personal information I submit with it, including my sign-off) is
   maintained indefinitely and may be redistributed consistent with
   this project or the open source license(s) involved.
