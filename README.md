# angular-dataValidator v0.0.1

> Controller-side validator for AngularJS.


## Development

### Workspace configuration

- Install [NodeJs](http://nodejs.org/), [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/),
- Run the following comand lines to donwload NodeJS and Bower components:
```
npm install
bower install
```

Grunt tasks are :
- `grunt test`: Apply jshint checks and karma unit tests,
- `grunt clean`: removes all the build file,
- `grunt build`: build a dist version in donwloads directory,
- `grunt sampleapp`: Launch a sample application on port 9000.

### TODO
- Push a downloadable zip file in the 
- Full source documentation,
- Add `Validator.register(...)` to register custom constraints,
- Add `isError(object)` on Validator,
- Add a global error handling configuration feature,
- Add options to validate & check functions : `flatten`, `stopOnError`.
