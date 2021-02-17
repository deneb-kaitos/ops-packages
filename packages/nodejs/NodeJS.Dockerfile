ARG DEBIAN_FRONTEND=noninteractive
ARG node_version

FROM debian:buster-slim AS os-base
SHELL ["/bin/bash", "-c"]
RUN apt-get --assume-yes --no-install-recommends --no-install-suggests update \
    && apt-get --assume-yes --no-install-recommends --no-install-suggests upgrade \
    && apt-get --assume-yes --no-install-recommends --no-install-suggests install \
      ca-certificates \
      curl \
    && apt-get purge --assume-yes --autoremove \
    && apt-get clean --assume-yes \
    && rm -rf /var/lib/apt/lists/*

FROM os-base AS add-builder-user
RUN useradd \
    --home-dir /home/builder \
    --create-home \
    --no-log-init \
    --shell /bin/bash \
    builder

FROM add-builder-user AS install-node
ARG node_version
WORKDIR /home/builder
RUN mkdir -p node_v$node_version/sysroot/{lib/x86_64-linux-gnu,lib64,proc,usr/lib/x86_64-linux-gnu} \
    && curl -O https://nodejs.org/dist/v$node_version/node-v$node_version-linux-x64.tar.gz \
    && tar -xzf node-v$node_version-linux-x64.tar.gz \
    && cp node-v$node_version-linux-x64/bin/node ./node_v$node_version/ \
    && rm -rf node-v$node_version-linux-x64 \
    && rm -f node-v$node_version-linux-x64.tar.gz

FROM install-node AS copy-package-files
ARG node_version
WORKDIR /home/builder
RUN cp /lib/x86_64-linux-gnu/libc.so.6 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libdl.so.2 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libgcc_s.so.1 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libm.so.6 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libnss_dns.so.2 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libnss_files.so.2 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libpthread.so.0 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/libresolv.so.2 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/librt.so.1 ./node_v$node_version/sysroot/lib/x86_64-linux-gnu/ \
    && cp /lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 ./node_v$node_version/sysroot/lib64/ \
    && cp /proc/meminfo ./node_v$node_version/sysroot/proc/ \
    && cp /usr/lib/x86_64-linux-gnu/libstdc++.so.6 ./node_v$node_version/sysroot/usr/lib/x86_64-linux-gnu/ \
    && cp /usr/lib/x86_64-linux-gnu/libssl.so.1.1 ./node_v$node_version/sysroot/usr/lib/x86_64-linux-gnu/ \
    && cp /usr/lib/x86_64-linux-gnu/libcrypto.so.1.1 ./node_v$node_version/sysroot/usr/lib/x86_64-linux-gnu/
COPY packages/nodejs/files/package.manifest ./node_v$node_version/

FROM copy-package-files AS archive-package
ARG node_version
WORKDIR /home/builder
RUN tar -czvf node_v$node_version.tar.gz ./node_v$node_version/ \
    && rm -rf ./node_v$node_version
