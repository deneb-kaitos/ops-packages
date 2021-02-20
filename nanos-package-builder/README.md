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
npbuild pkg nodejs build v15.9.0 --output-directory ~/.ops/local_packages --install
```
