# nanos package builder

## get a list of supported packages

```bash
npbuild pkg list
```

## get available versions of a package

```bash
npbuild pkg nodejs versions
```

## create a specific version of the package

```bash
npbuild pkg nodejs build v15.10.0 --output-directory ~/.ops/local_packages --install
```

## create a nodejs image w/ a project

```bash
npbuild image create --package-name=node_v15.10.0 --image-name=kaufmann-web --project-directory=./tests/node/front-end --output-directory ~/.ops/local_packages
```
