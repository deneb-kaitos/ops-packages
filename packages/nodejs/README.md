# NodeJS

## build

* build NodeJS from source in Docker
* find the following files in the Docker image:

```bash
├── node_v15.10.0
│   ├── node
│   ├── package.manifest
│   └── sysroot
│       ├── lib
│       │   └── x86_64-linux-gnu
│       │       ├── libc.so.6
│       │       ├── libdl.so.2
│       │       ├── libgcc_s.so.1
│       │       ├── libm.so.6
│       │       ├── libnss_dns.so.2
│       │       ├── libnss_files.so.2
│       │       ├── libpthread.so.0
│       │       └── libresolv.so.2
│       ├── lib64
│       │   └── ld-linux-x86-64.so.2
│       ├── proc
│       │   └── meminfo
│       └── usr
│           └── lib
│               └── x86_64-linux-gnu
│                   └── libstdc++.so.6
```

* pack this tree into `node_v15.10.0.tar.gz`
* retrieve the `node_v15.10.0.tar.gz` to the host system.
